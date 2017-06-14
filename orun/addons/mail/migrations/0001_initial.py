# Generated by Orun 0.0.1.dev20170614145150 on 2017-06-14 14:51
from orun.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.CreateSchema(
            name='mail',
        ),
        migrations.CreateModel(
            name='Alias',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('name', models.CharField(max_length=1024)),
                ('alias_contact', models.SelectionField(max_length=1024)),
                ('alias_model', models.ForeignKey(to='sys.model')),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.alias',
                'db_table': 'alias',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Channel',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('name', models.CharField(max_length=1024, null=False)),
                ('channel_type', models.SelectionField(max_length=1024)),
                ('description', models.TextField()),
                ('email_send', models.BooleanField()),
                ('public', models.SelectionField(max_length=1024)),
                ('groups', models.ManyToManyField(to='auth.group')),
                ('alias', models.ForeignKey(to='mail.alias')),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.channel',
                'db_table': 'channel',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Channel_groups',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('from_mail_channel', models.ForeignKey(null=False, to='mail.channel')),
                ('to_auth_group', models.ForeignKey(null=False, to='auth.group')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.channel_groups',
                'db_table': 'channel_groups',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ChannelPartner',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('fold_state', models.SelectionField(max_length=1024)),
                ('is_minimized', models.BooleanField()),
                ('is_pinned', models.BooleanField()),
                ('channel', models.ForeignKey(to='mail.channel')),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('partner', models.ForeignKey(to='res.partner')),
                ('seen_message', models.ForeignKey(to='mail.message')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.channel.partner',
                'db_table': 'channel_partner',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Follower',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('model_name', models.CharField(max_length=1024)),
                ('object_id', models.BigIntegerField()),
                ('subtypes', models.ManyToManyField(to='mail.message.subtype')),
                ('channel', models.ForeignKey(to='mail.channel')),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('partner', models.ForeignKey(to='res.partner')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.followers',
                'db_table': 'followers',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Follower_subtypes',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('from_mail_followers', models.ForeignKey(null=False, to='mail.followers')),
                ('to_mail_message_subtype', models.ForeignKey(null=False, to='mail.message.subtype')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.follower_subtypes',
                'db_table': 'follower_subtypes',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('subject', models.CharField(max_length=1024)),
                ('date_time', models.DateTimeField()),
                ('content', models.HtmlField()),
                ('model_name', models.CharField(max_length=1024)),
                ('object_id', models.BigIntegerField()),
                ('object_name', models.CharField(max_length=1024)),
                ('message_type', models.SelectionField(max_length=1024, null=False)),
                ('email_from', models.EmailField(max_length=1024)),
                ('recipes', models.ManyToManyField(to='res.partner')),
                ('need_action_recipes', models.ManyToManyField(to='res.partner')),
                ('channels', models.ManyToManyField(to='mail.channel')),
                ('message_id', models.CharField(max_length=1024)),
                ('reply_to', models.CharField(max_length=1024)),
                ('author', models.ForeignKey(to='res.partner')),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('mail_server', models.ForeignKey(to='sys.mail.server')),
                ('parent', models.ForeignKey(to='self')),
                ('subtype', models.ForeignKey(to='mail.message.subtype')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.message',
                'db_table': 'message',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Message_channels',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('from_mail_message', models.ForeignKey(null=False, to='mail.message')),
                ('to_mail_channel', models.ForeignKey(null=False, to='mail.channel')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.message_channels',
                'db_table': 'message_channels',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Message_need_action_recipes',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('from_mail_message', models.ForeignKey(null=False, to='mail.message')),
                ('to_res_partner', models.ForeignKey(null=False, to='res.partner')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.message_need_action_recipes',
                'db_table': 'message_need_action_recipes',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Message_recipes',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('from_mail_message', models.ForeignKey(null=False, to='mail.message')),
                ('to_res_partner', models.ForeignKey(null=False, to='res.partner')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.message_recipes',
                'db_table': 'message_recipes',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('is_read', models.BooleanField(db_index=True)),
                ('is_email', models.BooleanField(db_index=True)),
                ('email_status', models.SelectionField(db_index=True, max_length=1024)),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('mail_message', models.ForeignKey(null=False, to='mail.message')),
                ('partner', models.ForeignKey(null=False, to='res.partner')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.notification',
                'db_table': 'notification',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Partner',
            fields=[
            ],
            options={
                'name': 'res.partner',
                'db_table': 'res_partner',
                'extension': True,
                'abstract': False,
            },
            bases=('base.partner', models.Model),
        ),
        migrations.CreateModel(
            name='Subtype',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('updated_on', models.DateTimeField()),
                ('created_on', models.DateTimeField()),
                ('name', models.CharField(max_length=1024)),
                ('sequence', models.IntegerField()),
                ('description', models.TextField()),
                ('internal', models.BooleanField()),
                ('rel_field', models.CharField(max_length=1024)),
                ('model_name', models.CharField(max_length=1024)),
                ('default', models.BooleanField()),
                ('created_by', models.ForeignKey(to='auth.user')),
                ('parent', models.ForeignKey(to='self')),
                ('updated_by', models.ForeignKey(to='auth.user')),
            ],
            options={
                'name': 'mail.message.subtype',
                'db_table': 'message_subtype',
                'db_schema': 'mail',
                'abstract': False,
            },
        ),
        migrations.AlterIndexTogether(
            name='follower',
            index_together=set([('model_name', 'object_id')]),
        ),
    ]
