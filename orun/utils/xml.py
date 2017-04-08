from lxml import etree


def _get_xml_field(parent):
    for node in parent:
        if node.tag == 'field':
            yield node
        else:
            for child in _get_xml_field(node):
                yield child


def get_xml_fields(xml):
    return [f for f in _get_xml_field(etree.fromstring(xml))]
