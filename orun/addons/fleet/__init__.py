import orun
from orun.utils.translation import gettext_lazy as _


class AppConfig(orun.AppConfig):
    name = _('Fleet')
    version = '0.1'
    auto_install = False
    installable = True
    fixtures = ['actions.xml', 'menu.xml']
    #demo = ['demo.json']
    depends = ['base']
    db_schema = 'fleet'


addon = AppConfig()
