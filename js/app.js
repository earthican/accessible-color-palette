var app = angular.module('app', ['duScroll', 'colorpicker.module']);

//=============================================
// DIRECTIVES
//============================================
app.directive('slideOutLeft', function() {
  return {
    restrict: 'E',
    templateUrl: 'partials/slideOutLeft.html',
    replace: true,
    transclude: true,
    link: function(scope, element, attrs) {
    }
  };
});

//=============================================
// CONTROLLER
//============================================
app.controller('appController', function($scope, $http, $document, $timeout, appFactory) {
  /**
   * Model Data
   */
  $scope.appFactory = appFactory;
  $scope.allFontFamilies = $scope.appFactory.fonts;
  $scope.accessibilityGrades = $scope.appFactory.accessibilityGrades;
  $scope.textSizes = $scope.appFactory.textSizes;
  $scope.fontWeights = $scope.appFactory.fontWeights;
  $scope.allColors = $scope.appFactory.allColors;

  /**
   * Default States when App Loads
   */
  $scope.userContent = 'The quick brown fox jumps over the lazy dog.';
  $scope.fontFamily = $scope.allFontFamilies[0];
  $scope.fontSize = 22;
  $scope.fontWeight = 400;
  $scope.backgroundColor = { hex: '#ffffff'};
  $scope.currentTextColor = { hex: '#000', rgb: { r: 0, g: 0, b: 0}, currentRatio: 21, pass: true };
  $scope.WCAGlevel = 'AA';
  $scope.isIntroActive = true;
  $scope.isSection1Active = false;
  $scope.infoPanelTabIndex = -1;

  //==============================================================
  /**
   * User clicks on color to set as Current Color and generate passing colors off of that
   */
  $scope.setColor = function(event, color) {
    $scope.currentCopiedColor = null;
    if(event.metaKey){
      $scope.setBackgroundColor(color);
    }else{
      $scope.setTextColor(color);
      var currentColor = tinycolor(color.hex);
      color.rgb = currentColor.toRgb();
    }
    $scope.getPassingColors();
  };

  /**
   * When user clicks on color variation, make user text that color
   */
  $scope.setTextColor = function(color) {
    $scope.currentTextColor = color;
    $scope.animateToolbar = true;
    $timeout(function() {
      $scope.animateToolbar = false;
    }, 1000);
  };

  /**
   * User can select tile to make that the background color
   */
  $scope.setBackgroundColor = function(color) {
    $scope.backgroundColor = color;
  };

  /**
   * Checks if the color is dark or light
   */
  $scope.isDarkColor = function(colorValue) {
    var color = tinycolor(colorValue);
    if(color.isDark()){
      $scope.textColor = 'text-white';
    }else{
      $scope.textColor = 'text-dark';
    }
  };


  //==============================================================

  /**
   * Scroll Animation between step 1 to step 2
   * @thing - element to scroll to
   * @speed - duration of animation speed
   */
  $scope.slideToElement = function(thing, speed) {
    var offset = 0;
    var speed = speed;
    var thing = angular.element(document.getElementById(thing));
    if(!$scope.isSection2Active){
      $timeout(function() {
        $document.scrollToElementAnimated(thing, offset, speed);
      }, 200);
    }else{
      $document.scrollToElementAnimated(thing, offset, speed);
    }
  };

  /**
   * Show/hide Instructions 1 and 2 Modals.
   * Only show if it's the users' first time to website using HTML5 Local Storage
   */
  $scope.showInstructions1 = function() {
    if (!localStorage['instructions1']) {
      localStorage['instructions1'] = 'yes';
      $scope.isInstructions1Active = true;
    }
  };
  $scope.hideInstructions1 = function() {
    $scope.isInstructions1Active = false;
  };
  $scope.showInstructions2 = function(color, colorValue) {
    $scope.isInstructions2Active = true;
    $scope.currentCopiedColor = color;
    $scope.currentCopiedColorValue = colorValue;
    var color = tinycolor(colorValue);
    if(color.isDark()){
      $scope.modalTextColor = 'text-white';
    }else{
      $scope.modalTextColor = 'text-dark';
    }
    $timeout($scope.hideInstructions2, 1000);
  };
  $scope.hideInstructions2 = function() {
    $scope.isInstructions2Active = false;
  };

  /**
   * Activate Step 1 from Intro screen
   */
  $scope.activateStep1 = function() {
    $scope.isSection1Active = true;
    $timeout(function() {
      $scope.isIntroActive = false;
    }, 1000);
  };

  /**
   * Activate Section 2 Color Palette and Color Tiles using MixItUp() https://mixitup.kunkalabs.com/
   */
  $scope.activatePalette = function() {
    $scope.isSection2Active = true;
    $timeout(function() {
      $('#Container').mixItUp({
        layout: { display: 'table' }
      });
    }, 200);
    //console.log('activatePalette() is working');
  };


  /**
   * On Scroll, pin toolbar to top when picking colors from tiles
   */
  $document.on('scroll', function() {
    if( $('#section2').position().top >= $document.scrollTop() ){
      $scope.pinToolbar = false;
    }else{
      $scope.pinToolbar = true;
    }
    $scope.$apply();
  });


  /**
   * Show/hide info left panel
   */
  $scope.toggleInfoPanel = function() {
    $scope.isLeftSlideOpen = !$scope.isLeftSlideOpen;
    if($scope.isLeftSlideOpen){
      $scope.infoPanelTabIndex = 0;
    }else{
      $scope.infoPanelTabIndex = -1;
    }
  };


  //=============================================
  // COLOR CONTRAST LOGIC
  //=============================================

  /**
   * Get passing ratios of colors compared with current background color
   */
  $scope.getPassingColors = function() {
    _.each($scope.allColors, function(color) {
      var ratio = contrastRatio(color.hex, $scope.backgroundColor.hex);
      color.currentRatio = ratio;
      ratio >= $scope.currentRatio ? color.pass = true : color.pass = false;
    })
    //console.log('getPassingColors() is working');
  };

  /**
   * Calculate Current Ratio based on user inputs for font size and WCGAG Level AA or AAA
   */
  $scope.getCurrentRatio = function() {
    var currentFS = $scope.fontSize;
    var currentLevel = $scope.WCAGlevel;
    var currentFW = $scope.fontWeight;
    if(currentFW >= 700 && currentFS >= 14){
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
    }else if(currentFS < 18){
      currentLevel === 'AA' ? $scope.currentRatio = 4.5 : $scope.currentRatio = 7.0;
    }else{
      currentLevel === 'AA' ? $scope.currentRatio = 3.1 : $scope.currentRatio = 4.5;
    }
    //Determine if current text color passes if the AA or AAA changes
    $scope.currentTextColor.currentRatio >= $scope.currentRatio ? $scope.currentTextColor.pass = true :  $scope.currentTextColor.pass = false;
    //console.log('the current ratio is: ', $scope.currentRatio);
  };


  //=============================================
  // VENDOR CODE
  //=============================================
  /**
   * Sources of awesomeness:
   * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
   * http://webaim.org/resources/contrastchecker/
   * http://stackoverflow.com/a/5624139
   * http://stackoverflow.com/a/9733420
   */

  /**
   * @param {String} color, RGB or hex value of a color
   * @returns {Object} an object with properties r,g,b
   */
  function rgb(color) {
    // convert RGB string to RGB object
    var result = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(color);
    if(result) return {
      r: result[1],
        g: result[2],
          b: result[3]
    }

    // convert hex string to RGB object
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = color.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    // get RGB values from hex
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result) return {
      r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
    };

    // nothing! sad!
    return null;
  }

  /**
   * @param {Object} rgb, an object with properties r,g,b
   * @returns {Number} the luminance of this particular color
   */
  //
  function luminance(rgb) {
    // convert RGB to sRGB
    var sRGB = [rgb.r, rgb.g, rgb.b].map(function(value) {
      value /= 255;
      return (value <= 0.03928) ? (value / 12.92) : Math.pow( ((value+0.055)/1.055), 2.4);
    });
    // calculate luminance
    return (sRGB[0] * 0.2126) + (sRGB[1] * 0.7152) + (sRGB[2] * 0.0722);
  }

  /**
   * @param {String} foreground RGB or hex string for foreground color
   * @param {String} background RGB or hex string for background color
   * @returns {Number} the contrast between these two colors
   */
  function contrastRatio(foreground, background) {
    var L1 = luminance(rgb(foreground));
    var L2 = luminance(rgb(background));
    return (Math.round(((Math.max(L1, L2) + 0.05)/(Math.min(L1, L2) + 0.05))*100)/100);
  }


  /**
   * Zero Clipboard plugin to copy to clipboard
   */
  var client = new ZeroClipboard( document.getElementById("copyHexValue") );
  var rgbValue = new ZeroClipboard( document.getElementById("copyRgbValue") );

});

//=============================================
// FACTORY (DATA)
//============================================
app.factory('appFactory', function() {
  return {
    colorCategories: [
      { hex: '#2ECC71', rgb: '46, 204, 113', name: 'green', textColor: 'text-white' },
      { hex: '#3498DB', rgb: '52, 152, 219', name: 'blue', textColor: 'text-white' },
      { hex: '#9B59B6', rgb: '155, 89, 182', name: 'purple', textColor: 'text-white' },
      { hex: '#D2527F', rgb: '210, 82, 127', name: 'pink', textColor: 'text-white' },
      { hex: '#34495E', rgb: '52, 73, 94', name: 'gray', textColor: 'text-white', },
      { hex: '#F2CA27', rgb: '242, 202, 39', name: 'yellow', textColor: 'text-dark' },
      { hex: '#E67E22', rgb: '230, 126, 34', name: 'orange', textColor: 'text-white' },
      { hex: '#E74C3C', rgb: '231, 76, 60', name: 'red', textColor: 'text-white' }
    ],
    allColors: [
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#4ECDC4', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#A2DED0', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#87D37C', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#90C695', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#26A65B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#03C9A9', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#68C3A3', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#65C6BB', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#1BBC9B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#1BA39C', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#66CC99', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#36D7B7', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#C8F7C5', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#86E2D5', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#2ECC71', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#16A085', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#3FC380', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#019875', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#03A678', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#4DAF7C', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#2ABB9B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#00B16A', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#1E824C', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#049372', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'green', pass: true, hex: '#26C281', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#E4F1FE', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#4183D7', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#59ABE3', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#81CFE0', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#52B3D9', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#C5EFF7', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#22A7F0', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#3498DB', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#2C3E50', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#19B5FE', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#336E7B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#22313F', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#6BB9F0', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#1E8BC3', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#3A539B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#34495E', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#67809F', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#2574A9', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#1F3A93', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#89C4F4', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#4B77BE', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'blue', pass: true, hex: '#5C97BF', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#DCC6E0', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#663399', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#674172', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#AEA8D3', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#913D88', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#9A12B3', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#BF55EC', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#BE90D4', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#8E44AD', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'purple', pass: true, hex: '#9B59B6', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#DB0A5B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#FFECDB', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#F64747', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#F1A9A0', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#D2527F', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#E08283', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#F62459', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'pink', pass: true, hex: '#E26A6A', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#000000', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#FFFFFF', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#ECECEC', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#6C7A89', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#D2D7D3', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#EEEEEE', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#BDC3C7', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#ECF0F1', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#95A5A6', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#DADFE1', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#ABB7B7', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#F2F1EF', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'gray', pass: true, hex: '#BFBFBF', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'yellow', pass: true, hex: '#F5D76E', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'yellow', pass: true, hex: '#F7CA18', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'yellow', pass: true, hex: '#F4D03F', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#FDE3A7', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F89406', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#EB9532', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#E87E04', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F4B350', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F2784B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#EB974E', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F5AB35', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#D35400', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F39C12', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F9690E', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F9BF3B', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#F27935', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'orange', pass: true, hex: '#E67E22', rgb: '', name: '' },
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#D24D57', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#F22613', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#FF0000', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#D91E18', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#96281B', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#EF4836', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#D64541', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#C0392B', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#CF000F', rgb: '', name: ''},
      { type: 'flatUIcolor', colorParent: 'red', pass: true, hex: '#E74C3C', rgb: '', name: ''},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2ecc71", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#38f689", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#082213", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#114c2a", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#1b7742", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#24a159", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2ecc71", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2ecc32", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2ecc51", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2ecc71", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2ecc91", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"green", pass:true, hex:"#2eccb0", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#3498db", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#020406", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#0c2231", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#16405b", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#205d86", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#2a7ab0", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#3498db", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#34dbdb", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#34b9db", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#3498db", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#3477db", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"blue", pass:true, hex:"#3455db", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#9b59b6", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#bf6ee0", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#0a060c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#2e1b36", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#532f61", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#77448b", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#9b59b6", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#7659b6", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#8859b6", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#9b59b6", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#ae59b6", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"purple", pass:true, hex:"#b659ac", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d2527f", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#fc6399", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#281018", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#522032", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#7d314c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#a74165", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d2527f", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d252b2", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d25299", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d2527f", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d25265", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"pink", pass:true, hex:"#d25852", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#34495e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#4b6a88", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#638bb3", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#7bacdd", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#050709", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#1c2833", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#34495e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#345a5e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#34515e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#34495e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#34415e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"gray", pass:true, hex:"#34385e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#f2ca27", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#1d1905", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#483c0c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#726012", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#9d8319", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#c7a720", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#f2ca27", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#f27927", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#f2a127", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#f2ca27", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#f1f227", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"yellow", pass:true, hex:"#c9f227", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e67e22", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#110a03", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#3c2109", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#66380f", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#914f15", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#bb671c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e67e22", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e63022", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e65722", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e67e22", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e6a522", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"orange", pass:true, hex:"#e6cc22", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e74c3c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#120605", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#3d1410", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#67221b", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#923026", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#bc3e31", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e74c3c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e73c70", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e73c4e", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e74c3c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e76e3c", rgb:"", name:""},
      {type: 'tinyColor', colorParent:"red", pass:true, hex:"#e7903c", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#7fffd4", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#90ee90", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#00ff00", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#32cd32", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#3cb371", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#00fa9a", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#6b8e23", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#98fb98", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#2e8b57", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#00ff7f", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"green", pass:true, hex:"#9acd32", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#00ffff", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#6495ed", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#00008b", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#008b8b", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#483d8b", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#00ced1", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#00bfff", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#1e90ff", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#add8e6", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"blue", pass:true, hex:"#e0ffff", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"purple", pass:true, hex:"#8a2be2", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"purple", pass:true, hex:"#9932cc", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"purple", pass:true, hex:"#9400d3", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"purple", pass:true, hex:"#9370db", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"purple", pass:true, hex:"#dda0dd", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"pink", pass:true, hex:"#8b008b", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"pink", pass:true, hex:"#ff00ff", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"gray", pass:true, hex:"#708090", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"yellow", pass:true, hex:"#b8860b", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"yellow", pass:true, hex:"#ffd700", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"yellow", pass:true, hex:"#daa520", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"yellow", pass:true, hex:"#fffacd", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"orange", pass:true, hex:"#ff7f50", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"orange", pass:true, hex:"#ff8c00", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"orange", pass:true, hex:"#ffa07a", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"orange", pass:true, hex:"#ff4500", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"orange", pass:true, hex:"#f4a460", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"red", pass:true, hex:"#dc143c", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"red", pass:true, hex:"#8b0000", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"red", pass:true, hex:"#b22222", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"red", pass:true, hex:"#800000", rgb:"", name:""},
      {type: 'colorSibling', colorParent:"red", pass:true, hex:"#ff6347", rgb:"", name:""}
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7fffd4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#152a23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2a5547", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#40806a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#55aa8d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#6ad4b1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7fffd4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7fffa1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7fffba", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7fffd4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7fffee", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7ff7ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#90ee90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#0f1a0f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#294429", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#436e43", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#5d995d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#76c376", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#90ee90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#b6ee90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#a3ee90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#90ee90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#90eea3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#90eeb6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#002a00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#005500", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#008000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00aa00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00d400", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#66ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#33ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff33", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff66", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#32cd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cf73c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#092309", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#134d13", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#1d781d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#28a228", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#32cd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#70cd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#51cd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#32cd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#32cd51", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#32cd70", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb371", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#4add8c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#030906", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#113321", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#205e3b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8856", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb371", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb341", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb359", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb371", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb389", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb3a1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00fa9a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#002517", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#005031", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#007a4b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00a566", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00cf80", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00fa9a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00fa36", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00fa68", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00fa9a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00facc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00f6fa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#6b8e23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#8bb82d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#abe338", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#0b0e04", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2b390e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#4b6319", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#6b8e23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#8e8623", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#808e23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#6b8e23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#568e23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#408e23", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#98fb98", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#172617", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#315131", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#4b7b4b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#65a665", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7ed07e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#98fb98", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#c0fb98", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#acfb98", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#98fb98", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#98fbac", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#98fbc0", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b57", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3cb572", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#4ae08c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#040b07", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#123622", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#20603c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b57", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b44", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b57", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b6a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#2e8b7c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff7f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#002a15", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00552a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#008040", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00aa55", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00d46a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff7f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff19", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff4c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ff7f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ffb2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#00ffe5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#9acd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#baf73c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#1a2309", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#3a4d13", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#5a781d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7aa228", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#9acd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#cdc232", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#b9cd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#9acd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#7bcd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"green", pass:true, hex:"#5ccd32", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ffff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#002a2a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#005555", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00aaaa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00d4d4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ffff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ff99", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ffcc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ffff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ccff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0099ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#6495ed", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0a0f18", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1c2a43", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#2e456d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#406098", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#527ac2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#6495ed", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#64cced", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#64b0ed", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#6495ed", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#647aed", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#6a64ed", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0000b5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0000e0", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00000b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#000036", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#000060", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00388b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#001c8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1c008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#38008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008b8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00b5b5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00e0e0", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#000b0b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#003636", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#006060", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008b8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008b53", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008b6f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008b8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#006f8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00538b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#483d8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#5e50b5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#7462e0", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#06050b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1c1836", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#322a60", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#483d8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#3d518b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#3d428b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#483d8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#583d8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#673d8b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ced1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00f8fb", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#002627", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#005051", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#007a7c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00a4a6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ced1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00d180", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00d1aa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ced1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00a4d1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#007ad1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00bfff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00202a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#004055", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#006080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#007faa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#009fd4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00bfff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00ffd9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00f2ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#00bfff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#008cff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0059ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1e90ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#05182a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0a3055", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0f4880", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1460aa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1978d4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1e90ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1eeaff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1ebdff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1e90ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1e63ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#1e36ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#add8e6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#0d1011", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#2d383c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#4d6066", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#6d8891", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#8db0bb", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#add8e6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#ade6dd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#ade3e6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#add8e6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#adcde6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#adc1e6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0ffff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#252a2a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#4b5555", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#708080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#95aaaa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#bbd4d4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0ffff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0fff3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0fff9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0ffff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0f9ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"blue", pass:true, hex:"#e0f3ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#8a2be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#08030d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#220b38", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#3c1362", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#561b8d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#7023b7", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#8a2be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#412be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#652be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#8a2be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#af2be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#d32be2", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9932cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#b93cf6", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#190822", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#39134c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#591d77", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#7928a1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9932cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#5b32cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#7a32cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9932cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#b832cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#cc32c1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9400d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#b200fd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#1d0029", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#3b0053", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#58007e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#7600a8", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9400d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#4000d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#6a00d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9400d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#be00d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#d300be", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9370db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#040306", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#211931", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#3d2f5b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#5a4586", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#765ab0", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9370db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#7078db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#7e70db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#9370db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#a870db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#be70db", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#dda0dd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#080608", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#332533", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#5d445d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#886288", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#b381b3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#dda0dd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#c5a0dd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#d1a0dd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#dda0dd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#dda0d1", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"purple", pass:true, hex:"#dda0c5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#8b008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#b500b5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#e000e0", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#0b000b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#360036", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#600060", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#8b008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#53008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#6f008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#8b008b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#8b006f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#8b0053", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#ff00ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#2a002a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#550055", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#800080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#aa00aa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#d400d4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#ff00ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#9900ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#cc00ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#ff00ff", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#ff00cc", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"pink", pass:true, hex:"#ff0099", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#2a2a2a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#555555", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#aaaaaa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#d4d4d4", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#d3d3d3", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#fefefe", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#292929", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#545454", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#7e7e7e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#a9a9a9", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#939393", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#bebebe", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#e8e8e8", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#141414", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#3e3e3e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#696969", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#aaaaaa", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#d5d5d5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#2b2b2b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#555555", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#808080", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#708090", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#91a6ba", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#b2cce5", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#0d0f10", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#2e343b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#4f5a65", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#708090", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#708d90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#708690", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#708090", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#707a90", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"gray", pass:true, hex:"#707390", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#b8860b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#e2a50e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#0e0a01", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#382903", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#634806", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#8d6708", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#b8860b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#b8410b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#b8630b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#b8860b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#b8a90b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#a5b80b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#ffd700", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#2a2400", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#554800", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#806c00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#aa8f00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#d4b300", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#ffd700", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#ff7100", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#ffa400", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#ffd700", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#f4ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#c1ff00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#daa520", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#050401", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#302407", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#5a440d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#856514", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#af851a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#daa520", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#da5b20", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#da8020", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#daa520", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#daca20", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#c5da20", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#fffacd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#2a2a22", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#555344", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#807d67", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#aaa789", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#d4d0ab", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#fffacd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#ffe6cd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#fff0cd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#fffacd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#faffcd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"yellow", pass:true, hex:"#f0ffcd", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff7f50", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#2a150d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#552a1b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#804028", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#aa5535", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#d46a43", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff7f50", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff5067", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff5c50", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff7f50", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffa250", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffc550", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff8c00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#2a1700", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#552f00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#804600", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#aa5d00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#d47500", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff8c00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff2600", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff5900", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff8c00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffbf00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#fff200", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffa07a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#2a1b14", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#553529", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#80503d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#aa6b51", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#d48566", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffa07a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff7a89", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff857a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffa07a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffbb7a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffd57a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff4500", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#2a0b00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#551700", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#802200", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#aa2e00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#d43900", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff4500", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff0021", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff1200", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff4500", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ff7800", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#ffab00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f4a460", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#1f150c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#4a321d", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#744e2e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#9f6b3f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#c9874f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f4a460", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f46960", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f48660", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f4a460", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f4c260", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"orange", pass:true, hex:"#f4df60", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc143c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#070102", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#32050e", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#5c0819", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#870c25", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b11030", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc143c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc148c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc1464", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc143c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc1414", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc3c14", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b0000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b50000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#e00000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#0b0000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#360000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#600000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b0000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b0038", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b001c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b0000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b1c00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#8b3800", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b22222", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#dc2a2a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#080202", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#320a0a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#5d1212", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#871a1a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b22222", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b2225c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b2223f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b22222", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b23f22", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#b25c22", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#800000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#aa0000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#d50000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#000000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#2b0000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#550000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#800000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#800033", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#80001a", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#800000", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#801a00", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#803300", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ff6347", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#2a100c", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#552118", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#803224", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#aa422f", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#d4533b", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ff6347", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ff4775", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ff4750", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ff6347", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ff8847", rgb:"", name:""},
      //{type: 'colorSiblingTinyColor', colorParent:"red", pass:true, hex:"#ffad47", rgb:"", name:""}
    ],
    fonts: [
      { type: 'sans-serif', alias: 'Arial', name: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
      { type: 'sans-serif', alias: 'Arial Black', name: '"Arial Black", "Arial Bold", Gadget, sans-serif' },
      { type: 'sans-serif', alias: 'Arial Narrow', name: '"Arial Narrow", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Arial Rounded MT Bold', name: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Avant Garde', name: '"Avant Garde", Avantgarde, "Century Gothic", CenturyGothic, "AppleGothic", sans-serif' },
      { type: 'sans-serif', alias: 'Calibri', name: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Candara', name: 'Candara, Calibri, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Century Gothic', name: '"Century Gothic", CenturyGothic, AppleGothic, sans-serif' },
      { type: 'sans-serif', alias: 'Franklin Gothic Medium', name: '"Franklin Gothic Medium", "Franklin Gothic", "ITC Franklin Gothic", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Futura', name: 'Futura, "Trebuchet MS", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Geneva', name: 'Geneva, Tahoma, Verdana, sans-serif' },
      { type: 'sans-serif', alias: 'Gill Sans', name: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
      { type: 'sans-serif', alias: 'Helvetica', name: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Impact', name: 'Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans serif' },
      { type: 'sans-serif', alias: 'Lucida Grande', name: '"Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif' },
      { type: 'sans-serif', alias: 'Optima', name: 'Optima, Segoe, "Segoe UI", Candara, Calibri, Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Segoe UI', name: '"Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif' },
      { type: 'sans-serif', alias: 'Tahoma', name: 'Tahoma, Verdana, Segoe, sans-serif' },
      { type: 'sans-serif', alias: 'Trebuchet MS', name: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Tahoma, sans-serif' },
      { type: 'sans-serif', alias: 'Verdana', name: 'Verdana, Geneva, sans-serif' },
      { type: 'serif', alias: 'Baskerville', name: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Big Caslon', name: '"Big Caslon", "Book Antiqua", "Palatino Linotype", Georgia, serif' },
      { type: 'serif', alias: 'Bodoni MT', name: '"Bodoni MT", Didot, "Didot LT STD", "Hoefler Text", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Book Antiqua', name: '"Book Antiqua", Palatino, "Palatino Linotype", "Palatino LT STD", Georgia, serif' },
      { type: 'serif', alias: 'Calisto MT', name: '"Calisto MT", "Bookman Old Style", Bookman, "Goudy Old Style", Garamond, "Hoefler Text", "Bitstream Charter", Georgia, serif' },
      { type: 'serif', alias: 'Cambria', name: 'Cambria, Georgia, serif' },
      { type: 'serif', alias: 'Didot', name: 'Didot, "Didot LT STD", "Hoefler Text", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Garamond', name: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' },
      { type: 'serif', alias: 'Georgia', name: 'Georgia, Times, "Times New Roman", serif' },
      { type: 'serif', alias: 'Goudy Old Style', name: '"Goudy Old Style", Garamond, "Big Caslon", "Times New Roman", serif' },
      { type: 'serif', alias: 'Hoefler Text', name: '"Hoefler Text", "Baskerville old face", Garamond, "Times New Roman", serif' },
      { type: 'serif', alias: 'Lucida Bright', name: '"Lucida Bright", Georgia, serif' },
      { type: 'serif', alias: 'Palatino', name: 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif' },
      { type: 'serif', alias: 'Perpetua', name: 'Perpetua, Baskerville, "Big Caslon", "Palatino Linotype", Palatino, "URW Palladio L", "Nimbus Roman No9 L", serif' },
      { type: 'serif', alias: 'Rockwell', name: 'Rockwell, "Courier Bold", Courier, Georgia, Times, "Times New Roman", serif' },
      { type: 'serif', alias: 'Rockwell Extra Bold', name: '"Rockwell Extra Bold", "Rockwell Bold", monospace' },
      { type: 'serif', alias: 'TimesNewRoman', name: 'TimesNewRoman, "Times New Roman", Times, Baskerville, Georgia, serif' },
      { type: 'monospaced', alias: 'Andale Mono', name: '"Andale Mono", AndaleMono, monospace' },
      { type: 'monospaced', alias: 'Consolas', name: 'Consolas, monaco, monospace' },
      { type: 'monospaced', alias: 'Courier New', name: '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace' },
      { type: 'monospaced', alias: 'Lucida Console', name: '"Lucida Console", "Lucida Sans Typewriter", Monaco, "Bitstream Vera Sans Mono", monospace' },
      { type: 'monospaced', alias: 'Lucida Sans Typewriter', name: '"Lucida Sans Typewriter", "Lucida Console", Monaco, "Bitstream Vera Sans Mono", monospace' },
      { type: 'monospaced', alias: 'Monaco', name: 'Monaco, Consolas, "Lucida Console", monospace' },
      { type: 'fantasy', alias: 'Copperplate', name: 'Copperplate, "Copperplate Gothic Light", fantasy' },
      { type: 'fantasy', alias: 'Papyrus', name: 'Papyrus, fantasy' },
      { type: 'script',  alias: 'Brush Script MT', name: '"Brush Script MT", cursive' }
    ],
    accessibilityGrades: [ 'AA', 'AAA' ],
    textSizes: [ 'small text', 'large text' ],
    fontWeights: [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ]
  }
});
