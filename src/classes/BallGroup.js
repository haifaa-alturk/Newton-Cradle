// import * as THREE from 'three';

// export default class BallGroup {

//     constructor(scene) {

//         this.scene = scene;

//         this.group = new THREE.Group();

//         this.balls = [];
//         this.ropes = [];

        
//         this.ballRadius = 1;
//         this.ballSpacing = 2;
//         this.ballCount = 5;

        
//         this.ropeLength = 5;
//         this.topY = 5; 

//         const startX =
//             -((this.ballCount - 1) * this.ballSpacing) / 2;

//         for (let i = 0; i < this.ballCount; i++) {

//             const x = startX + i * this.ballSpacing;

//             this.createBall(x, i);
//         }

//         this.scene.add(this.group);

//         window.addEventListener('keydown', (event) => {

//             switch (event.key) {

//                 case '+':
//                 case '=':
//                     this.increaseBallSize();
//                     break;

//                 case '-':
//                     this.decreaseBallSize();
//                     break;

                
//                 case ']':
//                     this.changeRopeLength(0.5);
//                     break;

                
//                 case '[':
//                     this.changeRopeLength(-0.5);
//                     break;
//             }
//         });
//     }

//     createBall(x, index) {

//         const geometry = new THREE.SphereGeometry(
//             this.ballRadius,
//             64,
//             64
//         );

//         const material = new THREE.MeshStandardMaterial({
//             color: 0xc0c0c0,
//             metalness: 1,
//             roughness: 0.1
//         });

//         const ball = new THREE.Mesh(geometry, material);

        
//         const y = this.topY - this.ropeLength;

//         ball.position.set(x, y, 0);

//         this.balls.push(ball);
//         this.group.add(ball);

        
//         const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

//         const points = [];
//         points.push(new THREE.Vector3(x, this.topY, 0));
//         points.push(new THREE.Vector3(x, y, 0));

//         const ropeGeometry = new THREE.BufferGeometry().setFromPoints(points);

//         const rope = new THREE.Line(ropeGeometry, ropeMaterial);

//         this.ropes.push(rope);
//         this.group.add(rope);
//     }

//     updateRopes() {

//         this.balls.forEach((ball, i) => {

//             const x = ball.position.x;
//             const y = ball.position.y;

//             const rope = this.ropes[i];

//             const points = [
//                 new THREE.Vector3(x, this.topY, 0),
//                 new THREE.Vector3(x, y, 0)
//             ];

//             rope.geometry.setFromPoints(points);
//         });
//     }

//     changeRopeLength(delta) {

//         this.ropeLength += delta;

//         if (this.ropeLength < 1) this.ropeLength = 1;

//         this.balls.forEach(ball => {

//             ball.position.y = this.topY - this.ropeLength;
//         });

//         this.updateRopes();
//     }

//     increaseBallSize() {

//         this.ballRadius += 0.1;

//         this.balls.forEach(ball => {

//             ball.scale.set(
//                 this.ballRadius,
//                 this.ballRadius,
//                 this.ballRadius
//             );
//         });
//     }

//     decreaseBallSize() {

//         if (this.ballRadius > 0.2) {

//             this.ballRadius -= 0.1;

//             this.balls.forEach(ball => {

//                 ball.scale.set(
//                     this.ballRadius,
//                     this.ballRadius,
//                     this.ballRadius
//                 );
//             });
//         }
//     }
// }
import * as THREE from 'three';

const MIN_RADIUS = 0.15;
const MAX_RADIUS = 0.55;
const MIN_ROPE = 1.5;
const MAX_ROPE = 3.5; // قمت بزيادتها لتعطيكِ حرية أطول

export default class BallGroup {
 constructor(scene, cradleFrame, options = {}) {
    this.scene = scene;
    this.cradleFrame = cradleFrame;
    this.group = new THREE.Group();

    this.ballCount  = options.ballCount  ?? 5;
    this.ballRadius = options.ballRadius ?? 0.25;
    this.ropeLength = options.ropeLength ?? 2.0;
    
    // 👈 اجعلي الارتفاع ثابت مباشرة هنا ليطابق BAR_Y في الستاند القديم
    this.topY = 5.0; 

    this.spacing = this.ballRadius * 2 + 0.02;
    this.balls      = [];
    this.ropeGroups = []; 

    this._build();
    this.scene.add(this.group);

    window.addEventListener('keydown', (e) => this._onKey(e));
  }

 
_updateTopY() {
    this.topY = 5.0; // 👈 نثبتها عند 5.0 مباشرة بدون استدعاء أي دوال خارجية
  }

  _build() {
    this.balls.forEach(b => this.group.remove(b));
    this.ropeGroups.forEach(rg => rg.forEach(r => this.group.remove(r)));
    this.balls      = [];
    this.ropeGroups = [];

    this._updateTopY(); // تحديث الارتفاع والستاند قبل البناء

    this.spacing = this.ballRadius * 2 + 0.02;
    const startX = -((this.ballCount - 1) * this.spacing) / 2;

    const ballMat = new THREE.MeshPhysicalMaterial({
      color:     0xaabbcc,
      metalness: 0.95,
      roughness: 0.08,
      clearcoat: 0.5,
    });

    const ropeMat = new THREE.LineBasicMaterial({ color: 0xcccccc });

    // زيادة الـ Z لتبتعد الخيوط قليلاً وتناسب حجم الستاند والبار الجديدين
    const ropeZ = [0.05, -0.05];

    for (let i = 0; i < this.ballCount; i++) {
      const x   = startX + i * this.spacing;
      const ballY = this.topY - this.ropeLength - this.ballRadius; // تم التخلص من خطر الاختراق بفضل رفع الستاند

      const geo  = new THREE.SphereGeometry(this.ballRadius, 32, 32);
      const ball = new THREE.Mesh(geo, ballMat);
      ball.position.set(x, ballY, 0);
      ball.castShadow    = true;
      ball.receiveShadow = true;
      ball.userData.restX = x;
      ball.userData.index = i;
      this.group.add(ball);
      this.balls.push(ball);

      const ropes = ropeZ.map(z => {
        const pts = [
          new THREE.Vector3(x, this.topY, z),
          new THREE.Vector3(x, ballY + this.ballRadius, z),
        ];
        const ropeGeo  = new THREE.BufferGeometry().setFromPoints(pts);
        const rope     = new THREE.Line(ropeGeo, ropeMat);
        this.group.add(rope);
        return rope;
      });
      this.ropeGroups.push(ropes);
    }
  }

  updateRopes() {
    this.balls.forEach((ball, i) => {
      const x = ball.position.x;
      const y = ball.position.y;
    const ropeZ = [0.05, -0.05];
      this.ropeGroups[i].forEach((rope, j) => {
        const pts = [
          new THREE.Vector3(x, this.topY, ropeZ[j]),
          new THREE.Vector3(x, y + this.ballRadius, ropeZ[j]),
        ];
        rope.geometry.setFromPoints(pts);
      });
    });
  }

  // حساب مركز الكرة بناءً على الارتفاع الثابت وطول الخيط الحالي
  _ballY() {
    return this.topY - this.ropeLength - this.ballRadius;
  }

  // تغيير طول الخيط بسلاسة دون إعادة بناء الستاند
  changeRopeLength(delta) {
    // تعديل طول الخيط ضمن الحدود المسموحة
    this.ropeLength = Math.max(MIN_ROPE, Math.min(MAX_ROPE, this.ropeLength + delta));
    
    // تحديث موضع Y لجميع الكرات مباشرة بناءً على الطول الجديد
    const newY = this._ballY();
    this.balls.forEach(ball => {
      ball.position.y = newY;
    });
    
    // تحديث الخيوط لتصل إلى الموضع الجديد
    this.updateRopes(); 
  }
  changeRadius(delta) {
    const newR = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, this.ballRadius + delta));
    if (newR === this.ballRadius) return;
    this.ballRadius = newR;
    this._build(); 
  }

  _onKey(e) {
    switch (e.key) {
      case '+': case '=': this.changeRadius(+0.05);  break;
      case '-':           this.changeRadius(-0.05);  break;
      case ']':           this.changeRopeLength(+0.3); break;
      case '[':           this.changeRopeLength(-0.3); break;
    }
  }

  update(angles) {
    // عند التحديث الفيزيائي، نستخدم الـ topY الديناميكي الجديد
    angles.forEach((angle, i) => {
      if (!this.balls[i]) return;
      const restX = this.balls[i].userData.restX;
      this.balls[i].position.x = restX + Math.sin(angle) * this.ropeLength;
      this.balls[i].position.y = this.topY - Math.cos(angle) * this.ropeLength - this.ballRadius;
    });
    this.updateRopes();
  }
}