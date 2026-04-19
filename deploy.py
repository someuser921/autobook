"""
Deploy autobook backend to server.
Usage: uv run --with paramiko deploy.py "PASSWORD"
"""
import sys
import os
import tarfile
import io
import paramiko

HOST = "144.31.251.128"
PORT = 22
USER = "root"
REMOTE_DIR = "/opt/autobook"
SERVICE_NAME = "autobook"
APP_PORT = 8091

EXCLUDE_DIRS = {".venv", "__pycache__", "dist"}
EXCLUDE_EXTS = {".pyc"}


def should_exclude(path: str) -> bool:
    parts = path.replace("\\", "/").split("/")
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    for ext in EXCLUDE_EXTS:
        if path.endswith(ext):
            return True
    return False


def make_tarball() -> bytes:
    buf = io.BytesIO()
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for root, dirs, files in os.walk(backend_dir):
            dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]
            for f in files:
                fp = os.path.join(root, f)
                if not should_exclude(fp):
                    arcname = os.path.relpath(fp, backend_dir)
                    tar.add(fp, arcname=arcname)
    return buf.getvalue()


def run(ssh: paramiko.SSHClient, cmd: str) -> str:
    print(f"  $ {cmd}")
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    if out.strip():
        print(out.strip().encode("cp1251", errors="replace").decode("cp1251"))
    if err.strip():
        print(("  " + err.strip()).encode("cp1251", errors="replace").decode("cp1251"))
    return out


def write_remote_file(sftp: paramiko.SFTPClient, remote_path: str, content: str):
    with sftp.open(remote_path, "w") as f:
        f.write(content)


def main():
    password = sys.argv[1] if len(sys.argv) > 1 else input("Password: ")

    print("Connecting...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=password)

    sftp = ssh.open_sftp()

    # Upload tarball
    print("\nPackaging backend...")
    tarball = make_tarball()
    remote_tar = "/tmp/autobook.tar.gz"
    with sftp.open(remote_tar, "wb") as f:
        f.write(tarball)
    print(f"Uploaded {len(tarball) // 1024} KB")

    # Upload .env
    env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
    if os.path.exists(env_path):
        sftp.put(env_path, "/tmp/autobook.env")
        print("Uploaded .env")

    # Write systemd service file via sftp (avoids heredoc issues)
    service_content = f"""[Unit]
Description=AutoBook API
After=network.target docker.service

[Service]
WorkingDirectory={REMOTE_DIR}
ExecStart=/root/.local/bin/uv run uvicorn app.main:app --host 0.0.0.0 --port {APP_PORT}
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1
Environment=ENVIRONMENT=production

[Install]
WantedBy=multi-user.target
"""
    write_remote_file(sftp, f"/etc/systemd/system/{SERVICE_NAME}.service", service_content)
    print("Wrote systemd service file")

    sftp.close()

    # Unpack
    print("\nDeploying files...")
    run(ssh, f"mkdir -p {REMOTE_DIR}")
    run(ssh, f"tar -xzf {remote_tar} -C {REMOTE_DIR}")
    run(ssh, f"rm {remote_tar}")
    run(ssh, f"mv /tmp/autobook.env {REMOTE_DIR}/.env")

    # Start postgres
    print("\nStarting PostgreSQL container...")
    run(ssh, f"cd {REMOTE_DIR} && docker compose up -d postgres")
    run(ssh, "sleep 4")

    # Install uv if needed
    print("\nSetting up Python env...")
    run(ssh, "which uv || curl -LsSf https://astral.sh/uv/install.sh | sh")
    run(ssh, f"cd {REMOTE_DIR} && ~/.local/bin/uv sync 2>&1 | tail -3")

    # Run migrations
    print("\nRunning migrations...")
    run(ssh, f"cd {REMOTE_DIR} && ~/.local/bin/uv run alembic upgrade head")

    # Start service
    print("\nStarting service...")
    run(ssh, "systemctl daemon-reload")
    run(ssh, f"systemctl enable {SERVICE_NAME}")
    run(ssh, f"systemctl restart {SERVICE_NAME}")
    run(ssh, f"sleep 2 && systemctl status {SERVICE_NAME} --no-pager | head -15")

    print("\nDone! Backend deployed.")
    print(f"  API: http://localhost:{APP_PORT} (on server)")
    print(f"  Next: add nginx config for api-auto.freedomxz.xyz -> localhost:{APP_PORT}")

    ssh.close()


if __name__ == "__main__":
    main()
