# Generated migration for transactions app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('categories', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Income',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('monto', models.DecimalField(decimal_places=2, max_digits=12)),
                ('descripcion', models.CharField(blank=True, max_length=255)),
                ('fecha', models.DateField()),
                ('es_recurrente', models.BooleanField(default=False)),
                ('frecuencia_dias', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ingresos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Ingreso',
                'verbose_name_plural': 'Ingresos',
                'ordering': ['-fecha'],
            },
        ),
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('monto', models.DecimalField(decimal_places=2, max_digits=12)),
                ('descripcion', models.CharField(blank=True, max_length=255)),
                ('fecha', models.DateField()),
                ('es_recurrente', models.BooleanField(default=False)),
                ('frecuencia_dias', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('categoria', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='categories.category')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gastos', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Gasto',
                'verbose_name_plural': 'Gastos',
                'ordering': ['-fecha'],
            },
        ),
    ]