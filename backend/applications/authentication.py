import secrets

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import AuthToken


class TokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION", "")
        if not header.startswith("Token "):
            return None

        key = header.removeprefix("Token ").strip()
        if not key:
            return None

        try:
            token = AuthToken.objects.select_related("user").get(key=key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")

        return (token.user, token)


def issue_token(user):
    token, _created = AuthToken.objects.get_or_create(
        user=user,
        defaults={"key": secrets.token_hex(20)},
    )
    return token
