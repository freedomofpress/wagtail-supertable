import re
from django import template
from django.utils.safestring import mark_safe


register = template.Library()


@register.simple_tag(takes_context=True)
def cell_rowspan(context, row_index, col_index, table_header=None):
    classnames = context.get("classnames")
    if classnames:
        if table_header is not None:
            row_index += 1
        index = (row_index, col_index)
        cell_class = classnames.get(index)
        if cell_class and "rowspan-" in cell_class:
            r = re.compile(r"\browspan-(?P<rowspan>\d+)\b")
            match = r.search(cell_class)
            if match:
                rowspan = match.group('rowspan')
                if rowspan != "1":
                    return mark_safe("rowspan={}".format(rowspan))
    return ""


@register.simple_tag(takes_context=True)
def cell_colspan(context, row_index, col_index, table_header=None):
    classnames = context.get("classnames")
    if classnames:
        if table_header is not None:
            row_index += 1
        index = (row_index, col_index)
        cell_class = classnames.get(index)
        if cell_class and "colspan-" in cell_class:
            # Using word boundary matcher checks that a text of format
            # colspan-{colspan} where {colspan} is the number that is
            # captured group. So if it matches, we can get the colspan
            # directly
            r = re.compile(r"\bcolspan-(?P<colspan>\d+)\b")
            match = r.search(cell_class)
            if match:
                colspan = match.group('colspan')
                if colspan != "1":
                    return mark_safe("colspan={}".format(colspan))
    return ""
