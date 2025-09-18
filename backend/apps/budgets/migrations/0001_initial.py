# Generated migration for budgets app

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
            name='MonthlyBudget',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('año', models.IntegerField()),
                ('mes', models.IntegerField()),
                ('presupuesto_total', models.DecimalField(decimal_places=2, max_digits=12)),
                ('gastado_actual', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('activo', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='monthly_budgets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Presupuesto Mensual',
                'verbose_name_plural': 'Presupuestos Mensuales',
                'ordering': ['-año', '-mes'],
            },
        ),
        migrations.CreateModel(
            name='CategoryBudget',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('limite_asignado', models.DecimalField(decimal_places=2, max_digits=12)),
                ('gastado_actual', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('alerta_porcentaje', models.IntegerField(default=80)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('categoria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='categories.category')),
                ('presupuesto_mensual', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='category_budgets', to='budgets.monthlybudget')),
            ],
            options={
                'verbose_name': 'Presupuesto por Categoría',
                'verbose_name_plural': 'Presupuestos por Categoría',
                'ordering': ['categoria__nombre'],
            },
        ),
        migrations.CreateModel(
            name='BudgetAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('category_warning', 'Advertencia de categoría'), ('category_exceeded', 'Categoría excedida'), ('monthly_warning', 'Advertencia mensual'), ('monthly_exceeded', 'Presupuesto mensual excedido')], max_length=20)),
                ('mensaje', models.TextField()),
                ('porcentaje_gastado', models.DecimalField(decimal_places=2, max_digits=5)),
                ('monto_excedido', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('activa', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('presupuesto_categoria', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='budgets.categorybudget')),
                ('presupuesto_mensual', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='budgets.monthlybudget')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='budget_alerts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Alerta de Presupuesto',
                'verbose_name_plural': 'Alertas de Presupuesto',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='monthlybudget',
            constraint=models.UniqueConstraint(fields=('usuario', 'año', 'mes'), name='unique_user_month_budget'),
        ),
        migrations.AddConstraint(
            model_name='categorybudget',
            constraint=models.UniqueConstraint(fields=('presupuesto_mensual', 'categoria'), name='unique_budget_category'),
        ),
    ]