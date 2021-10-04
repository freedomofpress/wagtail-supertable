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
            r = re.compile("rowspan-.*")
            classes = cell_class.split()
            rowspan = list(filter(r.match, classes))
            if rowspan:
                rowspan = rowspan[0].replace("rowspan-", "")
                if rowspan != 1:
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
            r = re.compile("colspan-.*")
            classes = cell_class.split()
            colspan = list(filter(r.match, classes))
            if colspan:
                colspan = colspan[0].replace("colspan-", "")
                if colspan != 1:
                    return mark_safe("colspan={}".format(colspan))
    return ""
