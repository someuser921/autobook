import paramiko, sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("144.31.251.128", username="root", password=sys.argv[1])

def run(cmd):
    _, o, e = ssh.exec_command(cmd)
    out = o.read().decode(errors="replace").strip()
    err = e.read().decode(errors="replace").strip()
    print(f"$ {cmd}")
    if out: print(out)
    if err: print("ERR:", err)
    print()

run("ls /opt/autobook/alembic/versions/")
run("cd /opt/autobook && ~/.local/bin/uv run alembic heads 2>&1")
run("cd /opt/autobook && ~/.local/bin/uv run alembic current 2>&1")
ssh.close()
