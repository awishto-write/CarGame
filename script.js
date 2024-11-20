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

// Setup buffer data for a simple car (rectangle for now)
const carVertices = new Float32Array([
  // X, Y, Z
  -0.1, -0.05, 0.0,
   0.1, -0.05, 0.0,
   0.1,  0.05, 0.0,
  -0.1,  0.05, 0.0,
]);

const carVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, carVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, carVertices, gl.STATIC_DRAW);

// Setup car indices for drawing (rectangle)
const carIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
const carIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, carIndices, gl.STATIC_DRAW);

// Initialize matrices
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

const modelViewMatrix = mat4.create();
mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.0]);

// Controls
let carX = 0.0;

function handleKeyDown(event) {
  if (event.key === 'ArrowLeft') carX -= 0.05; // Move left
  if (event.key === 'ArrowRight') carX += 0.05; // Move right
}

document.addEventListener('keydown', handleKeyDown);

// Render function
function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, carVertexBuffer);
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);

    const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
    const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
    const uColor = gl.getUniformLocation(program, 'uColor');

    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [carX, -0.8, -2.0]); // Move car with controls

    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    gl.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0); // Red color for the car

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, carIndexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
}

// Start rendering
render();