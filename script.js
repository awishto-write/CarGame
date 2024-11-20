// Get WebGL context
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

// Resize canvas to fit the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Vertex shader (handles 3D positions)
const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// Fragment shader (handles color)
const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 uColor;

    void main(void) {
        gl_FragColor = uColor;
    }
`;

// Compile shaders
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

// Create WebGL program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking program:', gl.getProgramInfoLog(program));
}

// Create buffers
// Car vertices
const carVertices = new Float32Array([
    -0.15, -0.05, 0.0, // Bottom left
     0.15, -0.05, 0.0, // Bottom right
     0.15,  0.05, 0.0, // Top right
    -0.15,  0.05, 0.0  // Top left
  ]);
  

const carVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, carVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, carVertices, gl.STATIC_DRAW);

const carIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
const carIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, carIndices, gl.STATIC_DRAW);

// Road vertices
const roadVertices = new Float32Array([
  -1.0, -1.0, 0.0, // Bottom left
   1.0, -1.0, 0.0, // Bottom right
   1.0,  0.0, 0.0, // Top right
  -1.0,  0.0, 0.0  // Top left
]);

const roadVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, roadVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, roadVertices, gl.STATIC_DRAW);

const roadIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
const roadIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, roadIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, roadIndices, gl.STATIC_DRAW);

// Lane markings vertices
const laneVertices = new Float32Array([
  -0.05, -0.8, 0.0, // Bottom left
   0.05, -0.8, 0.0, // Bottom right
   0.05, -0.7, 0.0, // Top right
  -0.05, -0.7, 0.0  // Top left
]);

const laneVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, laneVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, laneVertices, gl.STATIC_DRAW);

const laneIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
const laneIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laneIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, laneIndices, gl.STATIC_DRAW);

// Initialize matrices
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 3, canvas.width / canvas.height, 0.1, 10.0);


const modelViewMatrix = mat4.create();

// Controls
let carPosition = { x: 0.0, y: -0.2, z: -1.5 }; // Center horizontally and adjust vertically

const maxSway = 0.5; // Max left/right sway
let roadOffset = 0.0; // Simulate road movement

const keyState = {
    ArrowLeft: false,
    ArrowRight: false,
};

document.addEventListener("keydown", (event) => {
    if (event.key in keyState) keyState[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    if (event.key in keyState) keyState[event.key] = false;
});



// Main render loop
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    gl.useProgram(program);
  
    const vertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPosition);
  
    const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    const uColor = gl.getUniformLocation(program, "uColor");
  
    // Functions to draw objects
    function drawRoad() {
      gl.uniform4f(uColor, 0.2, 0.2, 0.2, 1.0); // Gray road color
      gl.bindBuffer(gl.ARRAY_BUFFER, roadVertexBuffer);
      gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, roadIndexBuffer);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
  
    function drawLaneMarkings() {
      gl.uniform4f(uColor, 1.0, 1.0, 1.0, 1.0); // White lane markings
      for (let i = -1.0; i <= 1.0; i += 0.2) { // Repeat markings along road
        // Draw car
        mat4.identity(modelViewMatrix);
        mat4.translate(modelViewMatrix, modelViewMatrix, [carPosition.x, carPosition.y, carPosition.z]);
        gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
        gl.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0); // Red car color
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carIndexBuffer);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

      }
    }
  
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  
    // Update car position based on controls
    if (keyState.ArrowLeft) carPosition.x = Math.max(carPosition.x - 0.02, -maxSway);
    if (keyState.ArrowRight) carPosition.x = Math.min(carPosition.x + 0.02, maxSway);
  
    // Update roadOffset and loop it within a range
    roadOffset -= 0.02; // Move road backward
    if (roadOffset < -2.0) {
      roadOffset += 2.0; // Reset offset after one cycle
    }
  
    // Draw road
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, roadOffset % 2.0, -2.0]);
    drawRoad();
  
    // Draw lane markings
    drawLaneMarkings();
  
    // Draw car
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [carPosition.x, carPosition.y, carPosition.z]);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0); // Red car color
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  
    requestAnimationFrame(render);
  }
  

// Start rendering
render();
