from setuptools import setup, find_packages
from os import path
from wagtailsupertable import __version__

here = path.abspath(path.dirname(__file__))
with open(path.join(here, 'README.rst')) as f:
    long_description = f.read()


setup(
    name='wagtail-supertable',
    version=__version__,

    packages=find_packages(),
    include_package_data=True,

    description='An extended wagtail table block.',
    long_description=long_description,

    url='https://github.com/freedomofpress/wagtail-supertable',

    install_requires=[
        'wagtail>=2.13',
    ],

    extras_require={
        'docs': [
            'Sphinx>=1.7',
            'sphinx_rtd_theme>=0.4.0',
        ],
        'test': [
            'tox',
            'pytest>=3.5',
            'pytest-django>=3.2',
            'beautifulsoup4>=4.8',
            'html5lib>=0.999999999',
            'pytest-pythonpath>=0.7.2',
        ],
    },

    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Framework :: Django',
        'Framework :: Django :: 2.2',
        'Framework :: Django :: 3.0',
        'Framework :: Django :: 3.1',
        'Framework :: Django',
        'Framework :: Wagtail',
        'Framework :: Wagtail :: 2',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ],
)
