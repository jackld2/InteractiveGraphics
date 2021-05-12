
/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@eillinois.edu>  
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;

/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


/* Loads the mesh for the Illini logo, translation to corners of the screen*/
function loadVerticesLogo() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var triangleVertices = [
      //UPPER
        -0.5,  0.7,  0.0,
        -0.5,  0.4,  0.0,
        -0.2,  0.4,  0.0,
      
        -0.5,  0.7,  0.0,
        -0.2,  0.7,  0.0,
        -0.2,  0.4,  0.0,
      
         0.2,  0.4,  0.0,
        -0.2,  0.7,  0.0,
        -0.2,  0.4,  0.0,
        
         0.2,  0.4,  0.0,
        -0.2,  0.7,  0.0,
         0.2,  0.7,  0.0,
      
         0.2,  0.4,  0.0,
         0.5,  0.4,  0.0,
         0.2,  0.7,  0.0,
      
         0.5,  0.7,  0.0,
         0.5,  0.4,  0.0,
         0.2,  0.7,  0.0,
      
      //LOWER
      
        -0.5,  -0.7,  0.0,
        -0.5,  -0.4,  0.0,
        -0.2,  -0.4,  0.0,
      
        -0.5,  -0.7,  0.0,
        -0.2,  -0.7,  0.0,
        -0.2,  -0.4,  0.0,
      
         0.2,  -0.4,  0.0,
        -0.2,  -0.7,  0.0,
        -0.2,  -0.4,  0.0,
        
         0.2,  -0.4,  0.0,
        -0.2,  -0.7,  0.0,
         0.2,  -0.7,  0.0,
      
         0.2,  -0.4,  0.0,
         0.5,  -0.4,  0.0,
         0.2,  -0.7,  0.0,
      
         0.5,  -0.7,  0.0,
         0.5,  -0.4,  0.0,
         0.2,  -0.7,  0.0,
        
      
        //Center Triangles
        -0.2,  0.4,  0.0,
         0.2,  0.4,  0.0,
        -0.2, -0.4,  0.0,
        
        -0.2, -0.4,  0.0,
         0.2, -0.4,  0.0,
         0.2,  0.4,  0.0,
      
      
        //Border
      
        -0.5,   0.7,  0.0,
        -0.55,  0.75, 0.0,
        -0.5,   0.4,  0.0,
      
        -0.55,  0.35, 0.0,
        -0.55,  0.8, 0.0,
        -0.5,   0.4,  0.0,
      
         0.5,   0.7,  0.0,
         0.55,  0.75, 0.0,
         0.5,   0.4,  0.0,
      
         0.55,  0.35, 0.0,
         0.55,  0.75, 0.0,
         0.5,   0.4,  0.0,
      
        -0.5,   0.7,  0.0,
        -0.55,  0.75, 0.0,
        -0.2,   0.7,  0.0,
      
        -0.2,   0.75,  0.0,
        -0.55,  0.75, 0.0,
        -0.2,   0.7,  0.0,
      
         0.5,   0.7,  0.0,
         0.55,  0.75, 0.0,
         0.2,   0.7,  0.0,
      
         0.2,   0.75,  0.0,
         0.55,  0.75, 0.0,
         0.2,   0.7,  0.0,
      
         0.2,   0.75,  0.0,
        -0.2,   0.75, 0.0,
         0.2,   0.7,  0.0,
      
         0.2,   0.7,  0.0,
        -0.2,   0.75, 0.0,
        -0.2,   0.7,  0.0,
      
        -0.55, 0.35, 0.0,
        -0.5 , 0.4 , 0.0,
        -0.2 , 0.4 , 0.0,
      
        -0.55, 0.35, 0.0,
        -0.25, 0.35, 0.0,
        -0.2 , 0.4 , 0.0,
      
      
         0.55, 0.35, 0.0,
         0.5 , 0.4 , 0.0,
         0.2 , 0.4 , 0.0,
      
         0.55, 0.35, 0.0,
         0.25, 0.35, 0.0,
         0.2 , 0.4 , 0.0,
      
        //Mirror border
      
        -0.5,   -0.7,  0.0,
        -0.55,  -0.75, 0.0,
        -0.5,   -0.4,  0.0,
      
        -0.55,  -0.35, 0.0,
        -0.55,  -0.75, 0.0,
        -0.5,   -0.4,  0.0,
      
         0.5,   -0.7,  0.0,
         0.55,  -0.75, 0.0,
         0.5,   -0.4,  0.0,
      
         0.55,  -0.35, 0.0,
         0.55,  -0.75, 0.0,
         0.5,   -0.4,  0.0,
      
        -0.5,   -0.7,  0.0,
        -0.55,  -0.75, 0.0,
        -0.2,   -0.7,  0.0,
      
        -0.2,   -0.75,  0.0,
        -0.55,  -0.75, 0.0,
        -0.2,   -0.7,  0.0,
      
         0.5,   -0.7,  0.0,
         0.55,  -0.75, 0.0,
         0.2,   -0.7,  0.0,
      
         0.2,   -0.75,  0.0,
         0.55,  -0.75, 0.0,
         0.2,   -0.7,  0.0,
      
         0.2,   -0.75,  0.0,
        -0.2,   -0.75, 0.0,
         0.2,   -0.7,  0.0,
      
         0.2,   -0.7,  0.0,
        -0.2,   -0.75, 0.0,
        -0.2,   -0.7,  0.0,
      
        -0.55, -0.35, 0.0,
        -0.5 , -0.4 , 0.0,
        -0.2 , -0.4 , 0.0,
      
        -0.55, -0.35, 0.0,
        -0.25, -0.35, 0.0,
        -0.2 , -0.4 , 0.0,
      
      
         0.55, -0.35, 0.0,
         0.5 , -0.4 , 0.0,
         0.2 , -0.4 , 0.0,
      
         0.55, -0.35, 0.0,
         0.25, -0.35, 0.0,
         0.2 , -0.4 , 0.0,
      
      
        //sides
        -0.2 ,  0.4 , 0.0,
        -0.25,  0.35, 0.0,
        -0.2 , -0.4 , 0.0,
      
        -0.25 , -0.35 , 0.0,
        -0.25,  0.35, 0.0,
        -0.2 , -0.4 , 0.0,
      
         0.2 ,  0.4 , 0.0,
         0.25,  0.35, 0.0,
         0.2 , -0.4 , 0.0,
      
         0.25 , -0.35 , 0.0,
         0.25,  0.35, 0.0,
         0.2 , -0.4 , 0.0,     
  ];
    
    //Animates the logo with translations in x and y direction
    for (i=0; i<triangleVertices.length;i++) {
        if (i% 3 == 1) {
            //console.log("BEFORE", triangleVertices[i]);
            triangleVertices[i] = triangleVertices[i] + 0.25;
            //console.log("AFTER", triangleVertices[i]);
        }
        if (i% 3 == 0) {
            //console.log("BEFORE", triangleVertices[i]);
            triangleVertices[i] = triangleVertices[i] + 0.45;
            //console.log("AFTER", triangleVertices[i]);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = 138;
}

/* loads the colors for the Illini logo into the buffer*/
function loadColorsLogo() {
    vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        0.906, .289, 0.152, 1.0,
        
      
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0,
        0.0  , 0.0 , 0.502, 1.0
        
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 135;
    
}

/* Loads custom mesh into the buffer performs animation*/
function loadVerticesCustom() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    var triangleVertices = [
        -1.0, -1.0, 0.0,
        -0.75, 1.0, 0.0,
        -0.5, -1.0, 0.0,
        
        -0.5, -1.0, 0.0,
        -0.25, 1.0, 0.0,
         0.0, -1.0, 0.0,
        
         0.0, -1.0, 0.0,
         0.25, 1.0, 0.0,
         0.5, -1.0, 0.0,
        
         0.5, -1.0, 0.0,
         0.75, 1.0, 0.0,
         1.0, -1.0, 0.0,
        
        
        -1.0,  1.0, 0.0,
        -0.75,-1.0, 0.0,
        -0.5,  1.0, 0.0,
        
        -0.5,  1.0, 0.0,
        -0.25,-1.0, 0.0,
         0.0,  1.0, 0.0,
        
         0.0,  1.0, 0.0,
         0.25,-1.0, 0.0,
         0.5,  1.0, 0.0,
        
         0.5,  1.0, 0.0,
         0.75,-1.0, 0.0,
         1.0,  1.0, 0.0,
        
      
  ];
    
    //Move the point of each triangle towards the 0 y coord with staggered angles for cos function
        triangleVertices[4] = -1 +  (Math.abs(Math.cos(degToRad(rotAngle))));
        triangleVertices[13] = -1 + (Math.abs(Math.cos(degToRad(rotAngle+20))));
        triangleVertices[22] = -1 + (Math.abs(Math.cos(degToRad(rotAngle+40))));
        triangleVertices[31] = -1 + (Math.abs(Math.cos(degToRad(rotAngle+60))));
        
        triangleVertices[40] = 1 + -1*(Math.abs(Math.cos(degToRad(rotAngle))));
        triangleVertices[49] = 1 +  -1*(Math.abs(Math.cos(degToRad(rotAngle+20))));
        triangleVertices[58] = 1 +  -1*(Math.abs(Math.cos(degToRad(rotAngle+40))));
        triangleVertices[67] = 1 +  -1*(Math.abs(Math.cos(degToRad(rotAngle+60))));
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = 24;
}

/* Loads custom color animation into the buffer*/
function loadColorsCustom() {
    vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        0.0, .7, 1.0, 1.0,
        
    ];
    
    //Color modification for every triangle tip point in the color vertex array
    for (j=0; j<8; j++) {
        for (i = 0; i<3;i++) {
            colors[4+(j*12)+i] = (Math.abs(Math.cos(degToRad(rotAngle+ i*50))));
        }
    }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 24;
    
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
    loadVerticesLogo();
    loadColorsLogo();
}

/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() {
    
  console.log("State", document.getElementById("logo").checked);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);
    
  if(document.getElementById("logo").checked) {
      mat4.identity(mvMatrix);
      mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));
      mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));
  }
  else {
        mat4.identity(mvMatrix);
  }
    
  

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
                          
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() {
    //if logo button checked, perform logo animation, else custom animation
    if (document.getElementById("logo").checked) {
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        loadVerticesLogo();
        loadColorsLogo();
    }
    else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        loadVerticesCustom();
        loadColorsCustom();
    }
    
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngle= (rotAngle+1.0) % 360;
    }
    lastTime = timeNow;
    if (lastTime != 0) {
        
    }
}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

