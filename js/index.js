/** @type {HTMLCanvasElement} */

const d_canvas = document.getElementById("drawing");
const p_canvas = document.getElementById("prediction");
const r_canvas = document.getElementById("resizer");
const d_ctx = d_canvas.getContext('2d');
const p_ctx = p_canvas.getContext('2d');
const r_ctx = r_canvas.getContext('2d');
const d_w = d_canvas.width = 400;
const d_h = d_canvas.height = 400;
const p_w = p_canvas.width = 510;
const p_h = p_canvas.height = 400;
const r_w = r_canvas.width = 28;
const r_h = r_canvas.height = 28;

p_ctx.font = "30px Arial";
for (let i = 0 ; i < 10 ; i++) {
    p_ctx.fillStyle = "#ffffff";
    p_ctx.fillText(i, 50*i + 20, 380);
}

const mouse = {
    x : undefined,
    y : undefined
};

let down = false;
let r = d_canvas.getBoundingClientRect();

d_ctx.fillStyle = "#000000";
d_ctx.fillRect(0, 0, d_w, d_h);
d_ctx.fillStyle = "#ffffff";

// * Event Listeners

window.addEventListener('resize', () => {
    r = d_canvas.getBoundingClientRect();
});

d_canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    if (down) {
        d_ctx.beginPath();
        d_ctx.arc(mouse.x, mouse.y, 10, 0, 2*Math.PI);
        d_ctx.fill();
    }
});

d_canvas.addEventListener('mousedown', () => {
    down = true;
});

d_canvas.addEventListener('mouseup', () => {
    down = false;
});

// * Functions

function clear_canvas() {
    d_ctx.clearRect(0, 0, d_w, d_h);
    d_ctx.fillStyle = "#000000";
    d_ctx.fillRect(0, 0, d_w, d_h);
    d_ctx.fillStyle = "#ffffff"; 
}

function predict() {
    r_ctx.clearRect(0, 0, r_w, r_h);
    r_ctx.drawImage(d_canvas, 0, 0, r_w, r_h);

    const img_data = r_ctx.getImageData(0, 0, r_w, r_h);
    const i_d = img_data.data;
    let data = [];

    for (let y = 0 ; y < r_h ; y++) {
        let row = [];
        for (let x = 0 ; x < r_w ; x++) {
            const index = (y * r_w + x) * 4;
            const r = i_d[index];
            const g = i_d[index + 1];
            const b = i_d[index + 2];
            const grayscale = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            row.push(grayscale);
        }
        data.push(row);
    }

    fetch('http://127.0.0.1:5000/api/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: data })
    })
    .then(response => response.json())
    .then(data => {
        // prediction = data;
        draw_prediction(data['prediction'][0]);
        console.log('Success');
    })
    .catch((error) => {
        alert("Server is offline!");
        console.error('Error:', error);
    });

}

function draw_prediction(prediction) {
    p_ctx.clearRect(0, 0, p_w, p_h);
    // console.log(prediction);
    e_h = p_h * 0.9;
    for (let i = 0 ; i < prediction.length ; i++) {
        p_ctx.fillStyle = "#ff8a3d";
        p_ctx.fillRect(50*i + 10, p_h - e_h*prediction[i], 40, e_h);
        p_ctx.fillStyle = "#ffffff";
        p_ctx.fillText(i, 50*i + 20, 380);
    }
    
}
