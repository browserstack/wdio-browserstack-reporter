let path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp');

const WdioReporter = require('@wdio/reporter').default;
const Launcher = require('@wdio/cli').default;

class BrowserStackReporter extends WdioReporter {

  constructor(options) {
    options = Object.assign(options)
    super(options)
  }

  onRunnerStart(runner) {} 

  onBeforeCommand(runner) {} 

  onAfterCommand(runner) {} 

  onScreenshot(runner) {} 

  onSuiteStart(runner) {} 

  onHookStart(runner) {} 

  onHookEnd(runner) {} 

  onTestStart(runner) {} 

  onTestPass(runner) {} 

  onTestFail(runner) {} 

  onTestSkip(runner) {} 

  onTestEnd(runner) {} 

  onSuiteEnd(runner) {}

  onRunnerEnd(runner) {

    var sessionId = runner.sessionId;
    var sepcs = runner.specs;
    var specPathStringArray = sepcs[0].split("/");
    var specNameWithExtension = specPathStringArray[specPathStringArray.length - 1]
    var specName = specNameWithExtension.substring(0, specNameWithExtension.lastIndexOf("."));

    const xml = this.prepareXml(runner)
    let filename = 'REPORT-browserstack.all.xml'
    this.write(filename, xml)

  } 

  onComplete(runner){}

  onSingleFileOutput () {
    const xml = this.prepareXml(this.runnerStat)
    let filename = `REPORT-browserstack.all.xml`
    this.write(filename, xml)
  }
  
  prepareName(name = 'Skipped test') {
    return name.split(/[^a-zA-Z0-9]+/).filter(
      (item) => item && item.length
    ).join('_')
  }

  prepareXml(runner){

    let thisRunner = this;
    let sessionId = runner.sessionId;

    var xmlbuilder = require('xmlbuilder');
    const builder = xmlbuilder.create('testsuites', {encoding: 'UTF-8', allowSurrogateChars: true})
    
    for (let keySuites of Object.keys(thisRunner.suites)) {

      let suite = thisRunner.suites[keySuites];
      let suiteTitle = suite.title;
      let suiteFullTitle = suite.fullTitle;
      
      const suiteNameForXML = this.prepareName(suite.title);
      const testSuiteForXML = builder.ele("testsuite", {name: suiteNameForXML});

      for (let keyTests of Object.keys(suite.tests)) {

        let tests = suite.tests[keyTests];
        let testsTitle = tests.title;
        let testsFullTitle = tests.fullTitle;

        const testNameForXML = this.prepareName(testsTitle);
        const testCaseForXML = testSuiteForXML.ele("testcase",{name: testNameForXML, id: `${suiteFullTitle}.${testNameForXML}{0}`, index: 0 });
        testCaseForXML.ele("session", {}, sessionId);

      }
    }
    return builder.end({ pretty: true});
  }

  write(filename, xml) {

    var outputDir = "."
    if (this.options && typeof this.options.outputDir == 'string') {
      outputDir = this.options.outputDir
    }
    outputDir = `${outputDir}/browserstack-reports`

    try {
      const dir = path.resolve(outputDir)
      const filepath = path.join(dir, filename)
      mkdirp.sync(dir)
      fs.writeFileSync(filepath, xml)
      console.log(`Wrote xunit report "${filename}" to [${outputDir}].`)
    } catch (e) {
      console.log(`Failed to write xunit report "${filename}"
       to [${outputDir}]. Error: ${e}`)
    }
  }

}

module.exports.default = BrowserStackReporter
