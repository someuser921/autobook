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

run("ls /etc/nginx/sites-enabled/")
run("ls /etc/nginx/conf.d/")
run("grep -r 'api-auto' /etc/nginx/ 2>/dev/null")
run("grep -r '8091' /etc/nginx/ 2>/dev/null")
run("curl -s -o /dev/null -w '%{http_code}' https://api-auto.freedomxz.xyz/health")
ssh.close()
