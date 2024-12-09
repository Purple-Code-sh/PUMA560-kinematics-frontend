
# 3D Visualization and Inverse Kinematics for a Robot Arm

This project is a web-based application that demonstrates the functionality of a robotic arm through 3D visualization. It allows users to input coordinates and configure the arm's movement. The app calculates the inverse kinematics of the robot, displays the computed angles, and visualizes the trajectory and joints in a 3D scene.

---

## Features

- Coordinate input with adjustable step sizes (0.01, 0.1, 1, 10, 50).
- Configuration options for the arm (right/left) and elbow (up/down).
- Real-time WebSocket communication with the backend for kinematics calculation.
- Interactive 3D visualization with dynamic joint and trajectory rendering.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   ```
2. Navigate to the project folder:
   ```bash
   cd your-repo-name
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## How It Works

1. **Input and Configuration**:
   - Specify target coordinates (X, Y, Z) and select configuration options.
2. **WebSocket Communication**:
   - Sends input data to the backend and receives joint angles and trajectory points.
3. **3D Visualization**:
   - Visualizes the robot’s trajectory and joints dynamically.

---

## Usage

1. Launch the frontend using `npm run dev`.
2. Input desired target coordinates and configure the arm.
3. Press "Calculate Inverse" and observe the results in the 3D scene.

---

## Technologies Used

- **React**: Frontend framework.
- **Three.js**: 3D rendering library.
- **WebSocket**: Real-time backend communication.

---

## License

This project is licensed under the Mozilla Public License Version 2.0