## Setting up javascript unit tests

We use Resharper to manage our development javascript tests

First, install [PhantomJs](http://phantomjs.org/), a headless browser. It comes as a zip, don't forget to unlock the zip before extracting it. I put mine here `C:\Apps\phantomjs-2.0.0-windows\bin\phantomjs.exe`.

From the Resharper menu in Visual Studio select Options...

In the Tasks tab expand Unit Testing and highlight Javascript Tests 

You will need to

- Enable [QUnit](http://qunitjs.com/) support  
- Enable [Jasmine](http://jasmine.github.io/) support 
- Set the Jasmine version to 2.0
- You will need to specify path to the PhantomJS.exe. 
- Add the command line arguments `--proxy-type=none`
- Optionally add a path to a custom html harness `SpecsRunner.html`


Like this 

<img src="readme_fig_1.png" />


When you open up a javascript test file you will be able to run the test like you would a regular C# unit test.