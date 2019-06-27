let util = require('util'), 
  events = require('events'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp');

const WdioReporter = require('@wdio/reporter').default;

class BrowserStackReporter extends WdioReporter {

  constructor(options) {
    options = Object.assign(options)
    super(options)
  }

  onRunnerStart(runner) {
    console.log("====================onRunnerStart");
  } 

  onBeforeCommand(runner) {
    console.log("====================onBeforeCommand");
  } 

  onAfterCommand(runner) {
    console.log("====================onAfterCommand");
  } 

  onScreenshot(runner) {
    console.log("====================onScreenshot");
  } 

  onSuiteStart(runner) {
    console.log("====================onSuiteStart");
  } 

  onHookStart(runner) {
    console.log("====================onHookStart");
  } 

  onHookEnd(runner) {
    console.log("====================onHookEnd");
  } 

  onTestStart(runner) {
    console.log("====================onTestStart");
  } 

  onTestPass(runner) {
    console.log("====================onTestPass");
  } 

  onTestFail(runner) {
    console.log("====================onTestFail");
  } 

  onTestSkip(runner) {
    console.log("====================onTestSkip");
  } 

  onTestEnd(runner) {
    console.log("====================onTestEnd");
  } 

  onSuiteEnd(runner) {
    console.log("====================onSuiteEnd");
  } 

  onRunnerEnd(runner) {
    console.log("====================onRunnerEnd");
  } 

  onComplete(runner){
    console.log("==================== onComplete ++++++ +++ ");
  }


  // onAfterCommand(runner) {
  //   // this.onSingleFileOutput();
  //   console.log("====================onAfterCommand");
  // } 

  onSingleFileOutput () {
    // console.log('==>> THIS dump :: ' + JSON.stringify(this));
    // console.log('');
    // console.log('====================== this.runnerStat :: ' + JSON.stringify(this.runnerStat));
    const xml = this.prepareXml(this.runnerStat)
    let filename = `REPORT-browserstack.all.xml`
    this.write(filename, xml)
  } // FUNC onSingleFileOutput END
  
  prepareName(name = 'Skipped test') {
    return name.split(/[^a-zA-Z0-9]+/).filter(
      (item) => item && item.length
    ).join('_')
  } // FUNC prepareName END

  prepareXml(runners){
    var xmlbuilder = require('xmlbuilder');
    const builder = xmlbuilder.create('testsuites', {encoding: 'UTF-8', allowSurrogateChars: true})
    var testCaseIndex = 0;
    // console.log('====================== NEW prepareXml runners :: ' + JSON.stringify(runners));
    for (const key of Object.keys(runners)) {
      // console.log('=================>>> NEW key :: ' + key);
      const capabilities = runners[key]
      // console.log('=================>>> NEW prepareXml capabilities :: ' + JSON.stringify(capabilities));
      // console.log('=================>>> NEW prepareXml options :: ' + JSON.stringify(this.options));
      const packageName = this.options.packageName 
          ? `${capabilities.sanitizedCapabilities}-${this.options.packageName}`
          : capabilities.sanitizedCapabilities
      for (let specId of Object.keys(capabilities.specs)) {
        const spec = capabilities.specs[specId]

        for (let suiteKey of Object.keys(spec.suites)) {
          if (suiteKey.match(/^"before all"/)) {
            continue
          }

          const suite = spec.suites[suiteKey]
          const suiteName = this.prepareName(suite.title)
          const testSuite = builder.ele("testsuite", {name: suiteName})

          for (let testKey of Object.keys(suite.tests)) {
            if (testKey !== 'undefined') { 
              const test = suite.tests[testKey]
              const testName = this.prepareName(test.title)
              const testCase = testSuite.ele("testcase",{name: testName, id: `${suiteName}.${testName}{0}`, index: 0 });
              testCase.ele("session", {}, runners[key].sessionID);
              if (test.state === 'pending') {
                testCase.skipped()
              }
            }
          }
        }
      }
    }
    return builder.end({ pretty: true});
  } // FUNC prepareXml END

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
  } // FUNC write END

}

module.exports.default = BrowserStackReporter