# Generated migration for goals app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SavingGoal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=200)),
                ('descripcion', models.TextField(blank=True)),
                ('monto_objetivo', models.DecimalField(decimal_places=2, max_digits=12)),
                ('monto_actual', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('fecha_limite', models.DateField(blank=True, null=True)),
                ('completada', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metas_ahorro', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Meta de Ahorro',
                'verbose_name_plural': 'Metas de Ahorro',
                'ordering': ['-created_at'],
            },
        ),
    ]