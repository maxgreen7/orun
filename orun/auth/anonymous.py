

class AnonymousUser(object):
    @property
    def is_authenticated(self):
        return False
