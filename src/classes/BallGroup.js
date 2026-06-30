import * as THREE from 'three';

export default class BallGroup {

    constructor(scene) {

        this.scene = scene;

        this.group = new THREE.Group();

        this.balls = [];
        this.ropes = [];

        
        this.ballRadius = 1;
        this.ballSpacing = 2;
        this.ballCount = 5;

        
        this.ropeLength = 5;
        this.topY = 5; 

        const startX =
            -((this.ballCount - 1) * this.ballSpacing) / 2;

        for (let i = 0; i < this.ballCount; i++) {

            const x = startX + i * this.ballSpacing;

            this.createBall(x, i);
        }

        this.scene.add(this.group);

        window.addEventListener('keydown', (event) => {

            switch (event.key) {

                case '+':
                case '=':
                    this.increaseBallSize();
                    break;

                case '-':
                    this.decreaseBallSize();
                    break;

                
                case ']':
                    this.changeRopeLength(0.5);
                    break;

                
                case '[':
                    this.changeRopeLength(-0.5);
                    break;
            }
        });
    }

    createBall(x, index) {

        const geometry = new THREE.SphereGeometry(
            this.ballRadius,
            64,
            64
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 1,
            roughness: 0.1
        });

        const ball = new THREE.Mesh(geometry, material);

        
        const y = this.topY - this.ropeLength;

        ball.position.set(x, y, 0);

        this.balls.push(ball);
        this.group.add(ball);

        
        const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        const points = [];
        points.push(new THREE.Vector3(x, this.topY, 0));
        points.push(new THREE.Vector3(x, y, 0));

        const ropeGeometry = new THREE.BufferGeometry().setFromPoints(points);

        const rope = new THREE.Line(ropeGeometry, ropeMaterial);

        this.ropes.push(rope);
        this.group.add(rope);
    }

    updateRopes() {

        this.balls.forEach((ball, i) => {

            const x = ball.position.x;
            const y = ball.position.y;

            const rope = this.ropes[i];

            const points = [
                new THREE.Vector3(x, this.topY, 0),
                new THREE.Vector3(x, y, 0)
            ];

            rope.geometry.setFromPoints(points);
        });
    }

    changeRopeLength(delta) {

        this.ropeLength += delta;

        if (this.ropeLength < 1) this.ropeLength = 1;

        this.balls.forEach(ball => {

            ball.position.y = this.topY - this.ropeLength;
        });

        this.updateRopes();
    }

    increaseBallSize() {

        this.ballRadius += 0.1;

        this.balls.forEach(ball => {

            ball.scale.set(
                this.ballRadius,
                this.ballRadius,
                this.ballRadius
            );
        });
    }

    decreaseBallSize() {

        if (this.ballRadius > 0.2) {

            this.ballRadius -= 0.1;

            this.balls.forEach(ball => {

                ball.scale.set(
                    this.ballRadius,
                    this.ballRadius,
                    this.ballRadius
                );
            });
        }
    }
}