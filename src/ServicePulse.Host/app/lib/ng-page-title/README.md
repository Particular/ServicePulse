# ng-page-title

[![NPM Version][npm-image]][npm-url]
[![Bower Version][bower-image]][bower-url]
[![Build Status][travis-image]][travis-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![Dev Depedencies][dev-dependencies-image]][dev-dependencies-url]

Page title directive for an Angular project

# Why

The `<title>` tag is something that needs to be done on pretty much every project, but can be a right pain in the arse
in AngularJS if you aren't sure what you're doing.  This makes it the work of but-a-moment to put in a dynamic page
title. It also interpolates resolved data automatically.

This works for both [UI Router](http://angular-ui.github.io/ui-router/site/#/api/ui.router) states and the default
Angular [Route](https://docs.angularjs.org/api/ngRoute/service/$route).  If you are using UI Router, use the
`state-title` directive and if you are using _ngRoute_ then use the `page-title` directive.

# Get Started

Create your app and configure UI Router as normal.  Include ng-page-title by including it as a dependency to Angular

    angular.module("myApp", [
        "ngPageTitle"
        ...
    ]);

Ensure that the `ng-app` tag is on your `<html>` tag (usually, this would go on your `<body>` tag).  Then you can
create your `<title state-title></title>` or `<title page-title></title>` tag.  Here's the example HTML

    <!DOCTYPE html>
    <html ng-app="myApp">
        <head>
            <title state-title></title>
        </head>
        ...
    </html>

And if you're using ngRoute

    <!DOCTYPE html>
    <html ng-app="myApp">
        <head>
            <title page-title></title>
        </head>
        ...
    </html>

Now, in your routing files, set the `pageTitle` on the data object

    myApp.config(function ($stateProvider) {
        $stateProvider
            .state("state1", {
                data: {
                    pageTitle: "Home"
                },
                url: "/state1",
                templateUrl: "partials/state1.html"
            });
    }

Now, when you go to that state, the title tag will read:

    <title state-title>Home</title>

This directive interpolates the string too, so you can put in dynamic page titles

    myApp.config(function ($stateProvider) {
        $stateProvider
            .state("article", {
                data: {
                    pageTitle: "Article: {{ article.getTitle() }}"
                },
                resolve: {
                    article: function () {
                        return {
                            getTitle: function () {
                                return "Article Title"
                            }
                        };
                    }
                },
                url: "/article/:name",
                templateUrl: "partials/article.html"
            });
    }

This gives:

    <title state-title>Article: Article Title</title>

# Options

The API is the same for `state-title` and `page-title` - please treat it as interchangeable in this section.

## Default title

By default, the default title is "Untitled page"  If you want to put in your own default title, then pass a value in
to the page-title/state-title, eg: `<title page-title="Default title"></title>` or
`<title state-title="Default title"></title>`. This example will set to "Default title"

## Title element

By default, the directive will look for the `pageTitle` inside the data object.  This can be changed by setting the
title-element, eg: `<title state-title title-element="title"></title>`. This example will look for `data.title`

## Pattern

There might be times when you want to set a site title and only change the page title section, in which case use
pattern.  This will replace "%s" with the page title, eg: `<title state-title pattern="%s | My site"></title>`. For a
page called "Home", this will set the title to "Home | My site".

This will also work if you decide you want the title in multiple times.

# License

MIT License

[npm-image]: https://img.shields.io/npm/v/ng-page-title.svg?style=flat
[bower-image]: https://img.shields.io/bower/v/ng-page-title.svg?style=flat
[travis-image]: https://img.shields.io/travis/riggerthegeek/ng-page-title.svg?style=flat
[dependencies-image]: https://img.shields.io/david/riggerthegeek/ng-page-title.svg?style=flat
[dev-dependencies-image]: https://img.shields.io/david/dev/riggerthegeek/ng-page-title.svg?style=flat

[npm-url]: https://npmjs.org/package/ng-page-title
[bower-url]: http://bower.io/search/?q=ng-page-title
[travis-url]: https://travis-ci.org/riggerthegeek/ng-page-title
[dependencies-url]: https://david-dm.org/riggerthegeek/ng-page-title
[dev-dependencies-url]: https://david-dm.org/riggerthegeek/ng-page-title#info=devDependencies&view=table
