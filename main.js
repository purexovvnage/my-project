import * as glMatrix from './node_modules/gl-matrix';


var canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)

var gl = canvas.getContext('webgl')
var vertexData  = [
  // Front
  0.5,0.5,0.5,
  0.5,-0.5,0.5,
  -0.5,0.5,0.5,
  -0.5,0.5,0.5,
  0.5,-0.5,0.5,
  -0.5,-0.5,0.5,

  // Left
  -0.5,0.5,0.5,
  -0.5,-0.5,0.5,
  -0.5,0.5,-0.5,
  -0.5,0.5,-0.5,
  -0.5,-0.5,0.5,
  -0.5,-0.5,-0.5

  ,// Back
  -0.5,0.5,-0.5,
  -0.5,-0.5,-0.5,
  0.5,0.5,-0.5,
  0.5,0.5,-0.5,
  -0.5,-0.5,-0.5,
  0.5,-0.5,-0.5,

  // Right
  0.5,0.5,-0.5,
  0.5,-0.5,-0.5,
  0.5,0.5,0.5,
  0.5,0.5,0.5,
  0.5,-0.5,0.5,
  0.5,-0.5,-0.5,

  // Top
  0.5,0.5,0.5,
  0.5,0.5,-0.5,
  -0.5,0.5,0.5,
  -0.5,0.5,0.5,
  0.5,0.5,-0.5,
  -0.5,0.5,-0.5,

  // Bottom
  0.5,-0.5,0.5,
  0.5,-0.5,-0.5,
  -0.5,-0.5,0.5,
  -0.5,-0.5,0.5,
  0.5,-0.5,-0.5,
  -0.5,-0.5,-0.5
]

//var colorData = [
//  1,0,0,
//  0,1,0,
//  0,0,1
//]

function randomColor() {
  return [Math.random(),Math.random(),Math.random()]
}
//let colorData = [
//  ...randomColor(),
//  ...randomColor(),
//  ...randomColor(),
//]

let colorData = []
for (let face = 0; face < 6; face++) {
  let faceColor = randomColor()
  for (let vertex = 0; vertex < 6; vertex++) {
    colorData.push(...faceColor)
  }
}

var positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

var colorBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW)

var vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, [
  'precision highp float;',
  'attribute vec3 position;',
  'attribute vec3 color;',
  'varying vec3 vColor;',
  'uniform mat4 matrix;',

  'void main() {',
    'vColor = color;',
    'gl_Position = matrix * vec4(position, 1);',
  '}'
].join('\n'))
gl.compileShader(vertexShader)

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, [
  'precision highp float;',
  'varying vec3 vColor;',
  'void main() {', 
  'gl_FragColor = vec4(vColor,1);',
  '}'
].join('\n'))
gl.compileShader(fragmentShader)
console.log(gl.getShaderInfoLog(fragmentShader))

var program = gl.createProgram()
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)

gl.linkProgram(program)

const positionLocation  = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(positionLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

const colorLocation = gl.getAttribLocation(program, 'color')
gl.enableVertexAttribArray(colorLocation)
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
gl.vertexAttribPointer(colorLocation,3,gl.FLOAT,false,0,0)

gl.useProgram(program)
gl.enable(gl.DEPTH_TEST)

const uniformLocations = {
  matrix: gl.getUniformLocation(program,'matrix'),
}

const modelMatrix = glMatrix.mat4.create()
const viewMatrix = glMatrix.mat4.create()
const projectionMatrix = glMatrix.mat4.create()

glMatrix.mat4.perspective(projectionMatrix,
  90 * Math.PI/180, // verticle field-of-view (angle, radians)
  canvas.width/canvas.height, // aspect W/H
  1e-4, // near cull distance
  1e4 // far cull distance

)
const mvMatrix = glMatrix.mat4.create()
const mvpMatrix = glMatrix.mat4.create()
glMatrix.mat4.translate(modelMatrix,modelMatrix,[-1.5,0,-2])

glMatrix.mat4.translate(viewMatrix,viewMatrix,[-3,0,1])
glMatrix.mat4.invert(viewMatrix, viewMatrix)
//glMatrix.mat4.translate(matrix,matrix,[.2,.5,-.2])
//glMatrix.mat4.scale(matrix,matrix,[0.25,0.25,0.25])
console.log(modelMatrix)

function animate() {
  requestAnimationFrame(animate)
  glMatrix.mat4.rotateZ(modelMatrix,modelMatrix,Math.PI/2/70)
  glMatrix.mat4.rotateX(modelMatrix,modelMatrix,Math.PI/2/70)
  glMatrix.mat4.rotateY(modelMatrix,modelMatrix,Math.PI/2/70)

  // P * M
  glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
  glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)
  gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
  gl.drawArrays(gl.TRIANGLES, 0, vertexData.length/3)
}
animate()
