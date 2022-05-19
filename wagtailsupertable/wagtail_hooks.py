from django.templatetags.static import static
from django.utils.html import format_html

from wagtail.core import hooks


@hooks.register('insert_editor_css')
def editor_css():
    html = '<link rel="stylesheet" type="text/css" href="{}" />'.format(
        static('css/table-block.css')
    )
    return format_html(html)