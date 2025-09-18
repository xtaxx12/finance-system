# Generated migration for notifications app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('goals', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='NotificationPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('goal_deadline_enabled', models.BooleanField(default=True)),
                ('goal_completed_enabled', models.BooleanField(default=True)),
                ('goal_overdue_enabled', models.BooleanField(default=True)),
                ('savings_reminder_enabled', models.BooleanField(default=True)),
                ('milestone_reached_enabled', models.BooleanField(default=True)),
                ('deadline_days_before', models.IntegerField(default=7)),
                ('reminder_frequency_days', models.IntegerField(default=30)),
                ('web_notifications', models.BooleanField(default=True)),
                ('email_notifications', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('usuario', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='notification_preferences', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Preferencia de Notificación',
                'verbose_name_plural': 'Preferencias de Notificaciones',
            },
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('goal_deadline', 'Meta próxima a vencer'), ('goal_completed', 'Meta completada'), ('goal_overdue', 'Meta vencida'), ('savings_reminder', 'Recordatorio de ahorro'), ('milestone_reached', 'Hito alcanzado')], max_length=20)),
                ('titulo', models.CharField(max_length=200)),
                ('mensaje', models.TextField()),
                ('prioridad', models.CharField(choices=[('low', 'Baja'), ('medium', 'Media'), ('high', 'Alta'), ('urgent', 'Urgente')], default='medium', max_length=10)),
                ('leida', models.BooleanField(default=False)),
                ('data_extra', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('meta_relacionada', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='goals.savinggoal')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Notificación',
                'verbose_name_plural': 'Notificaciones',
                'ordering': ['-created_at'],
            },
        ),
    ]