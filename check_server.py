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

run("nginx -v")
run("nginx -V 2>&1 | grep -o 'http_v2_module'")
run("curl --http2 -s -o /dev/null -w 'HTTP version: %{http_version}\\n' https://api-auto.freedomxz.xyz/health")
run("curl --http2-prior-knowledge -s -o /dev/null -w 'HTTP: %{http_version}\\n' https://api-auto.freedomxz.xyz/health 2>&1 | head -3")
ssh.close()
