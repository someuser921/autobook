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

new_config = """server {
    listen 80;
    server_name api-auto.freedomxz.xyz;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 127.0.0.1:446 ssl http2 proxy_protocol;
    server_name api-auto.freedomxz.xyz;

    ssl_certificate     /etc/letsencrypt/live/api-auto.freedomxz.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-auto.freedomxz.xyz/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8091;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 30s;
    }
}
"""

sftp = ssh.open_sftp()
with sftp.open("/etc/nginx/sites-available/api-auto", "w") as f:
    f.write(new_config)
sftp.close()
print("Written nginx config with http2")

run("nginx -t")
run("systemctl reload nginx")
run("curl -s -o /dev/null -w 'HTTP version: %{http_version}\\n' https://api-auto.freedomxz.xyz/health")

ssh.close()
