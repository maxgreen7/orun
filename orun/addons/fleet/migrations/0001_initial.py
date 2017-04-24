# Generated by Orun 0.0.1.dev20170421233607 on 2017-04-21 23:36
from orun.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateSchema(
            name='fleet',
        ),
        migrations.CreateModel(
            name='Allocation',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('vehicle', models.ForeignKey(null=False, to='fleet.vehicle')),
                ('responsible', models.ForeignKey(to='res.partner')),
                ('start_date', models.DateTimeField(null=False)),
                ('end_date', models.DateTimeField()),
            ],
            options={
                'name': 'fleet.allocation',
                'db_table': 'allocation',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024, null=False)),
            ],
            options={
                'name': 'fleet.vehicle.category',
                'db_table': 'vehicle_category',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='CostType',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024, null=False, unique=True)),
                ('category', models.CharField(max_length=1024)),
            ],
            options={
                'name': 'fleet.cost.type',
                'db_table': 'cost_type',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='Driver',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('partner', models.ForeignKey(null=False, to='res.partner')),
                ('active', models.BooleanField()),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
            ],
            options={
                'name': 'fleet.driver',
                'db_table': 'driver',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='FuelLogItem',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('fuel_log', models.ForeignKey(null=False, to='fleet.vehicle.fuel.log')),
                ('item', models.CharField(max_length=1024, null=False)),
                ('qty', models.DecimalField(null=False)),
                ('unit', models.CharField(max_length=1024)),
                ('unit_price', models.DecimalField()),
                ('total', models.DecimalField()),
            ],
            options={
                'name': 'fleet.vehicle.fuel.log.item',
                'db_table': 'vehicle_fuel_log_item',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='Route',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024, null=False)),
                ('origin', models.CharField(max_length=1024, null=False)),
                ('destination', models.CharField(max_length=1024, null=False)),
                ('distance', models.DecimalField()),
                ('avg_speed', models.DecimalField()),
                ('back_distance', models.DecimalField()),
                ('avg_speed_back', models.DecimalField()),
                ('total_distance', models.DecimalField()),
                ('load_time', models.DecimalField()),
                ('unload_time', models.DecimalField()),
                ('avg_travel_time', models.DecimalField()),
                ('avg_back_time', models.DecimalField()),
                ('avg_wait_time', models.DecimalField()),
                ('avg_total_time', models.DecimalField()),
                ('notes', models.TextField()),
            ],
            options={
                'name': 'fleet.route',
                'db_table': 'route',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024)),
                ('color', models.IntegerField()),
            ],
            options={
                'name': 'fleet.tag',
                'db_table': 'tag',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('company', models.ForeignKey(to='res.company')),
                ('model', models.ForeignKey(null=False, to='fleet.vehicle.model')),
                ('model_year', models.SmallIntegerField()),
                ('manufacture_year', models.SmallIntegerField(null=False)),
                ('description', models.CharField(max_length=1024)),
                ('doors', models.SmallIntegerField()),
                ('seats', models.SmallIntegerField()),
                ('vehicle_state', models.ForeignKey(to='fleet.vehicle.state')),
                ('co2', models.FloatField()),
                ('transmission', models.CharField(max_length=1024)),
                ('license_plate', models.CharField(max_length=1024)),
                ('color', models.CharField(max_length=1024)),
                ('chassis', models.CharField(max_length=1024)),
                ('driver', models.ForeignKey(to='fleet.driver')),
                ('supplier', models.ForeignKey(to='res.partner')),
                ('active', models.BooleanField(null=False)),
                ('invoice_ref', models.CharField(max_length=1024)),
                ('acquisition_date', models.DateField()),
                ('ownership', models.CharField(max_length=1024)),
                ('cargo', models.CharField(max_length=1024)),
                ('weight_capacity', models.DecimalField()),
                ('weight', models.DecimalField()),
                ('weight_unit', models.CharField(max_length=1024)),
                ('odometer', models.DecimalField()),
                ('odometer_unit', models.CharField(max_length=1024)),
                ('hp', models.IntegerField()),
                ('lifespan_years', models.DecimalField()),
                ('lifespan_hours', models.DecimalField()),
                ('rented', models.BooleanField()),
                ('rent_value', models.DecimalField()),
                ('category', models.ForeignKey(to='fleet.vehicle.category')),
                ('autonomy', models.FloatField()),
                ('notes', models.TextField()),
                ('purchase_value', models.DecimalField()),
            ],
            options={
                'name': 'fleet.vehicle',
                'db_table': 'vehicle',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='VehicleCost',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('vehicle', models.ForeignKey(null=False, to='fleet.vehicle')),
                ('cost_type', models.ForeignKey(null=False, to='fleet.cost.type')),
                ('value', models.DecimalField()),
                ('due_date', models.DateField()),
                ('payment_date', models.DateField()),
                ('odometer', models.FloatField()),
                ('contract', models.ForeignKey(to='fleet.contract')),
            ],
            options={
                'name': 'fleet.vehicle.cost',
                'db_table': 'vehicle_cost',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='VehicleFuel',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('vehicle', models.ForeignKey(null=False, to='fleet.vehicle')),
                ('fuel', models.CharField(max_length=1024)),
                ('capacity', models.FloatField()),
                ('autonomy', models.DecimalField()),
            ],
            options={
                'name': 'fleet.vehicle.fuel',
                'db_table': 'vehicle_fuel',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='VehicleMake',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024, null=False, unique=True)),
            ],
            options={
                'name': 'fleet.vehicle.make',
                'db_table': 'vehicle_make',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='VehicleModel',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024, null=False)),
                ('vehicle_make', models.ForeignKey(null=False, to='fleet.vehicle.make')),
                ('model_type', models.CharField(max_length=1024)),
                ('image', models.BinaryField()),
            ],
            options={
                'name': 'fleet.vehicle.model',
                'db_table': 'vehicle_model',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='VehicleOdometer',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('vehicle', models.ForeignKey(null=False, to='fleet.vehicle')),
                ('driver', models.ForeignKey(null=False, to='fleet.driver')),
                ('reason', models.CharField(max_length=1024)),
                ('start_date', models.DateField(null=False)),
                ('current_odometer', models.DecimalField()),
                ('elapsed_distance', models.DecimalField()),
                ('end_date', models.DateField()),
                ('origin', models.CharField(max_length=1024, null=False)),
                ('destination', models.CharField(max_length=1024, null=False)),
                ('unit', models.CharField(max_length=1024)),
            ],
            options={
                'name': 'fleet.vehicle.odometer',
                'db_table': 'vehicle_odometer',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='VehicleState',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('updated_by', models.ForeignKey(to='auth.user')),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('name', models.CharField(max_length=1024)),
                ('color', models.IntegerField()),
            ],
            options={
                'name': 'fleet.vehicle.state',
                'db_table': 'vehicle_state',
                'db_schema': 'fleet',
            },
        ),
        migrations.CreateModel(
            name='Contract',
            fields=[
                ('vehiclecost_ptr', models.OneToOneField(primary_key=True, to='fleet.vehicle.cost', unique=True)),
                ('contract_no', models.CharField(max_length=1024, null=False)),
                ('description', models.CharField(max_length=1024)),
                ('contract_type', models.CharField(max_length=1024)),
                ('cost_frequency', models.CharField(max_length=1024)),
                ('status', models.CharField(max_length=1024, null=False)),
                ('start_date', models.DateField(null=False)),
                ('expiration_date', models.DateField()),
                ('supplier', models.ForeignKey(to='res.partner')),
                ('destination', models.CharField(max_length=1024, null=False)),
                ('notes', models.TextField()),
            ],
            options={
                'name': 'fleet.contract',
                'db_table': 'contract',
                'db_schema': 'fleet',
            },
            bases=('fleet.vehiclecost',),
        ),
        migrations.CreateModel(
            name='FuelLog',
            fields=[
                ('vehiclecost_ptr', models.OneToOneField(primary_key=True, to='fleet.vehicle.cost', unique=True)),
                ('driver', models.ForeignKey(to='fleet.driver')),
                ('date', models.DateTimeField(null=False)),
                ('autonomy', models.DecimalField()),
                ('invoice_ref', models.CharField(max_length=1024)),
            ],
            options={
                'name': 'fleet.vehicle.fuel.log',
                'db_table': 'vehicle_fuel_log',
                'db_schema': 'fleet',
            },
            bases=('fleet.vehiclecost',),
        ),
        migrations.CreateModel(
            name='Maintenance',
            fields=[
                ('vehiclecost_ptr', models.OneToOneField(primary_key=True, to='fleet.vehicle.cost', unique=True)),
                ('maintenance_type', models.CharField(max_length=1024, null=False)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('description', models.TextField()),
                ('responsible', models.ForeignKey(to='res.partner')),
                ('supplier', models.ForeignKey(to='res.partner')),
                ('assigned_employee', models.ForeignKey(to='res.partner')),
                ('supervisor_employee', models.ForeignKey(to='res.partner')),
                ('notes', models.TextField()),
            ],
            options={
                'name': 'fleet.vehicle.maintenance',
                'db_table': 'vehicle_maintenance',
                'db_schema': 'fleet',
            },
            bases=('fleet.vehiclecost',),
        ),
        migrations.CreateModel(
            name='TrafficTicket',
            fields=[
                ('vehiclecost_ptr', models.OneToOneField(primary_key=True, to='fleet.vehicle.cost', unique=True)),
                ('reason', models.CharField(max_length=1024)),
                ('date_time', models.DateTimeField()),
                ('kind', models.CharField(max_length=1024)),
                ('driver', models.ForeignKey(to='fleet.driver')),
                ('points', models.DecimalField()),
                ('notes', models.TextField()),
            ],
            options={
                'name': 'fleet.traffic.ticket',
                'db_table': 'traffic_ticket',
                'db_schema': 'fleet',
            },
            bases=('fleet.vehiclecost',),
        ),
    ]
