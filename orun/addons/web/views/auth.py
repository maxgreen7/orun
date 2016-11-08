from orun import request
from orun.utils.json import jsonify
from orun.views import BaseView, route


class Auth(BaseView):
    route_base = '/api/auth/'

    @route('/login/', methods=['GET', 'POST'])
    def login(self):
        if request.method == 'POST':
            return jsonify({'result': {'success': True, 'is_authenticated': True}})

    @route('/logout/')
    def logout(self):
        return jsonify({'result': {'success': True, 'is_authenticated': False, 'next': None}})
