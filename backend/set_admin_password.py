import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neighborly_backend.settings')
django.setup()

from accounts.models import User

# Set admin password
admin_user = User.objects.get(username='admin')
admin_user.set_password('admin123')
admin_user.user_type = 'admin'
admin_user.save()

print("Admin password set to: admin123")
print("Admin user type set to: admin")