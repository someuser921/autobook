import paramiko, sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("144.31.251.128", username="root", password=sys.argv[1])
sftp = ssh.open_sftp()

for name in ["39034170d5cf_add_planned_maintenance.py", "57f6c99e3790_add_odometer_updated_at.py"]:
    remote = f"/opt/autobook/alembic/versions/{name}"
    local = f"backend/alembic/versions/{name}"
    sftp.get(remote, local)
    print(f"Downloaded {name}")

sftp.close()
ssh.close()
