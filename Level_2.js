const config =
{
    type: Phaser.AUTO,
    width: 1710,
    height: 900,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            debug: false
            // debug: true
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let angle = 0;
let meteors = [];
let moveStone = [];
let background;
let StarBall1, StarBall2;
let moveStone1, moveStone2; //流星
const originalMeteorPositions = [];
const originalMoveStonePositions = [];
let initialPlayerPosition;
let moveStone1Timer, moveStone2Timer;
let controlsEnabled2 = false;
let firstClick2 = false;
let pictureout = true;
let againBtn;
let gamePaused = false;
let Bgm2;
let click;
let hitRock;

function preload() {
    // 載入需要的圖片路徑, 並設定變數名稱 
    this.load.image('rocket', './assets/rocket.png');
    this.load.image('bg', './assets/bg_starSee.png');
    this.load.image('stone_1', './assets/spaceStone_1.png');
    this.load.image('stone_2', './assets/spaceStone_2.png');
    this.load.image('stone_3', './assets/spaceStone_3.png');
    this.load.image('stone_4', './assets/spaceStone_4.png');
    this.load.image('stone_5', './assets/spaceStone_5.png');
    this.load.image('stone_6', './assets/spaceStone_6.png');
    this.load.image('stone_7', './assets/spaceStone_7.png');
    this.load.image('stone_8', './assets/spaceStone_8.png');
    this.load.image('stone_9', './assets/spaceStone_9.png');
    this.load.image('stone_10', './assets/spaceStone_10.png');
    this.load.image('stone_11', './assets/spaceStone_11.png');
    this.load.image('stone_12', './assets/spaceStone_12.png');
    this.load.image('stone_13', './assets/spaceStone_13.png');
    this.load.image('swampStarBall', './assets/swampStarBall.png');
    this.load.image('catStarBall', './assets/catStarBall.png');
    this.load.image('moveStone1', './assets/moveStone.png');
    this.load.image('moveStone2', './assets/moveStone2.png');
    this.load.image('photo', './assets/btn_click.png');
    this.load.image('photo_hover', './assets/btn_unclick.png');
    this.load.image('photo_again', './assets/btn_playAgain_unclick.png');

    // 加載音樂、音效
    this.load.audio('click', './SoundEffect/click.mp3')
    this.load.audio('bgm2', './SoundEffect/BGML2.mp3')
    this.load.audio('hit', './SoundEffect/hitrock.mp3')
    this.load.audio('hurt', './SoundEffect/cathurt.mp3')

    // 加載形狀數據
    this.load.json('rocket_data', './PhysicsEditor/rocket.json');
    this.load.json('spaceStone_data', './PhysicsEditor/spaceStone.json');
    this.load.json('catStarBall_data', './PhysicsEditor/catStarBall.json');
    this.load.json('moveStone1_data', './PhysicsEditor/moveStone.json');
    this.load.json('moveStone2_data', './PhysicsEditor/moveStone2.json');
}

function create() {
    cathurt = this.sound.add('hurt', { volume: 1.8 });
    click = this.sound.add('click', { volume: 0.2 });
    hitRock = this.sound.add('hit', { volume: 0.6 });
    Bgm2 = this.sound.add('bgm2', {
        volume: 0.3,
        loop: true
    });
    Bgm2.play();

    if (pictureout == true) {
        if (!firstClick2) {
            // 第一次點擊圖片時顯示第二是視窗
            document.getElementById('overlay1').style.display = 'flex';
            firstClick2 = true;
        } else {
            // 第二次點擊圖片時顯示第二是視窗
            document.getElementById('overlay2').style.display = 'flex';
            SecondClickClick2 = true;
        }
    }
    document.getElementById('overlay1').addEventListener('click', function () {
        // 隱藏第一個視窗
        click.play();
        document.getElementById('overlay1').style.display = 'none';
        document.getElementById('overlay2').style.display = 'flex';
    });
    document.getElementById('overlay2').addEventListener('click', function () {
        //  隱藏第二個視窗
        click.play();
        document.getElementById('overlay2').style.display = 'none';
        controlsEnabled2 = true;
    });

    background = this.add.tileSprite(0, 0, 8226, 1200, 'bg').setOrigin(0, 0).setScale(0.85).setDepth(0);
    this.matter.world.setBounds(0, 0, background.width, background.height);

    StarBall1 = this.add.image(-300, 0, 'swampStarBall').setOrigin(0, 0).setScale(1).setDepth(1);

    player = this.matter.add.image(220, 500, 'rocket', null, {
        shape: this.cache.json.get('rocket_data').rocket,
    }).setDepth(10).setScale(0.06);

    initialPlayerPosition = { x: player.x, y: player.y };

    let meteor1 = this.matter.add.image(1000, 180, 'stone_1', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_1,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor1);
    originalMeteorPositions.push({ x: meteor1.x, y: meteor1.y });

    let meteor2 = this.matter.add.image(1500, 700, 'stone_2', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_2,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor2);
    originalMeteorPositions.push({ x: meteor2.x, y: meteor2.y });

    let meteor3 = this.matter.add.image(2000, 500, 'stone_3', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_3,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor3);
    originalMeteorPositions.push({ x: meteor3.x, y: meteor3.y });

    let meteor4 = this.matter.add.image(2500, 700, 'stone_4', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_4,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor4);
    originalMeteorPositions.push({ x: meteor4.x, y: meteor4.y });

    let meteor5 = this.matter.add.image(3000, 140, 'stone_5', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_5,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor5);
    originalMeteorPositions.push({ x: meteor5.x, y: meteor5.y });

    let meteor6 = this.matter.add.image(3200, 350, 'stone_6', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_6,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor6);
    originalMeteorPositions.push({ x: meteor6.x, y: meteor6.y });

    let meteor7 = this.matter.add.image(3600, 750, 'stone_7', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_7,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor7);
    originalMeteorPositions.push({ x: meteor7.x, y: meteor7.y });

    let meteor8 = this.matter.add.image(3900, 100, 'stone_8', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_8,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor8);
    originalMeteorPositions.push({ x: meteor8.x, y: meteor8.y });

    let meteor9 = this.matter.add.image(4200, 500, 'stone_9', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_9,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor9);
    originalMeteorPositions.push({ x: meteor9.x, y: meteor9.y });

    let meteor10 = this.matter.add.image(4500, 800, 'stone_10', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_10,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor10);
    originalMeteorPositions.push({ x: meteor10.x, y: meteor10.y });

    let meteor11 = this.matter.add.image(4800, 100, 'stone_11', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_11,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor11);
    originalMeteorPositions.push({ x: meteor11.x, y: meteor11.y });

    let meteor12 = this.matter.add.image(5000, 300, 'stone_12', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_12,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor12);
    originalMeteorPositions.push({ x: meteor12.x, y: meteor12.y });

    let meteor13 = this.matter.add.image(5300, 800, 'stone_13', null, {
        shape: this.cache.json.get('spaceStone_data').spaceStone_13,
        isStatic: true
    }).setDepth(5).setScale(0.4).setAngle(angle);
    meteors.push(meteor13);
    originalMeteorPositions.push({ x: meteor13.x, y: meteor13.y });

    StarBall2 = this.matter.add.image(5800, 450, 'catStarBall', null, {
        shape: this.cache.json.get('catStarBall_data').catStarBall,
        isStatic: true
    }).setScale(2).setDepth(1).setOrigin(0.5, 0.6);

    // 在plater成功載入後，進行一些設置
    player.once('addedtoscene', () => {
        // 設置是否靜態（是否受世界邊界碰撞）
        player.setStatic(false); // 如果希望物體在世界邊界內碰撞，將參數設置為 false
        player.body.setBounce(2); // 設置彈性
        player.setFriction(0.1); // 设置摩擦力的值，你可以根据需要调整
        player.setGravityY(60); // 设置玩家的垂直重力
        player.setFixedRotation(true); // 防止玩家旋轉
    });

    // 增加輸入偵測
    cursors = this.input.keyboard.createCursorKeys();

    // 相機一些設定
    this.cameras.main.startFollow(player);
    this.matter.world.setBounds(0, 0, 5000, 900);
    let camera = this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, 5000, 900);
    camera.setViewport(0, 0, 1710, 900);

    //_秒后创建 moveStone 隕石
    // this.time.delayedCall(9000, () => {
    //     moveStone1 = this.matter.add.image(1500, 150, 'moveStone1', null, {
    //         shape: this.cache.json.get('moveStone1_data').moveStone,
    //         isStatic: true
    //     }).setDepth(5).setScale(0.8);
    // }, [], this);
    // moveStone.push(moveStone1);
    //originalMoveStonePositions.push({ x: moveStone1.x, y: moveStone1.y });

    // _秒后创建 moveStone2 隕石
    // this.time.delayedCall(10000, () => {
    //      moveStone2 = this.matter.add.image(2800, 1500, 'moveStone2', null, {
    //         shape: this.cache.json.get('moveStone2_data').moveStone2,
    //         isStatic: true
    //     }).setDepth(5).setScale(0.8);
    // }, [], this);
    // moveStone.push(moveStone2);
    //originalMoveStonePositions.push({ x: moveStone2.x, y: moveStone2.y });

    moveStone1 = this.matter.add.image(1500 + 6 * 60 * 25, 150 - 3 * 60 * 25, 'moveStone1', null, {
        shape: this.cache.json.get('moveStone1_data').moveStone,
        isStatic: true
    }).setDepth(5).setScale(0.8).setActive(false).setVisible(false); // 初始化為不活躍和不可見
    moveStone.push(moveStone1);
    originalMoveStonePositions.push({ x: moveStone1.x, y: moveStone1.y });

    moveStone2 = this.matter.add.image(2800 + 7 * 60 * 28, 1500 + 3 * 60 * 28, 'moveStone2', null, {
        shape: this.cache.json.get('moveStone2_data').moveStone2,
        isStatic: true
    }).setDepth(5).setScale(0.8).setActive(false).setVisible(false); // 初始化為不活躍和不可見
    moveStone.push(moveStone2);
    originalMoveStonePositions.push({ x: moveStone2.x, y: moveStone2.y });

    startMoveStoneTimers();

    // 設置字體樣式
    var textStyle = {
        fontFamily: 'LXGW WenKai Mono TC, Arial, sans-serif', // 使用你在Google Fonts上選擇的字體名稱
        fontSize: '30px',
        color: '#ffffff',
        align: 'center'
    };

    //重玩按鈕
    againBtn = document.createElement('img');
    againBtn.src = './assets/btn_playAgain_unclick.png';
    againBtn.style.position = 'absolute';
    againBtn.style.left = '75%';
    againBtn.style.top = '75%';
    againBtn.style.transform = 'translate(-50%, -50%)';
    againBtn.style.zIndex = 10;
    againBtn.style.display = 'none';
    againBtn.style.cursor = 'pointer';
    document.body.appendChild(againBtn);

    againBtn.addEventListener('click', function () {
        window.location.href = 'index.html';
    });
    againBtn.addEventListener('mouseover', function () {
        againBtn.src = './assets/btn_playAgain_click.png';
    });

    // Event listener for when the mouse moves out of the button
    againBtn.addEventListener('mouseout', function () {
        againBtn.src = './assets/btn_playAgain_unclick.png';
    });

    this.againBtn = againBtn;

    // 碰到貓星球後停止遊戲
    this.matterCollision.addOnCollideStart({
        objectA: player,
        callback: function (eventData) {
            const bodyB = eventData.bodyB;
            const gameObjectB = bodyB.gameObject;

            if (gameObjectB === StarBall2) {
                this.add.text(1175, 450, '恭喜Kitty抵達貓星！', textStyle).setDepth(20);
                this.againBtn.style.display = 'block';
                this.scene.pause(); // 暫停遊戲
                gamePaused = true;
            }
        },
        context: this
    });

    //碰到石頭重置遊戲
    meteors.forEach((meteor, index) => {
        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: meteor,
            callback: function (eventData) {
                // 碰撞後的處理邏輯
                hitRock.play();
            },
            context: this
        });
    });

    // 碰到流星重置遊戲
    moveStone.forEach((movestone, index) => {
        if (movestone) {
            this.matterCollision.addOnCollideStart({
                objectA: player,
                objectB: movestone,
                callback: function (eventData) {
                    console.log('Collision detected, restarting scene');
                    cathurt.play();
                    resetPlayerPosition(this);
                },
                context: this
            });
        }
    });

    var keyObject = this.input.keyboard.addKey('A');
    keyObject.on('down', function (event) {
        player.setStatic(player.isStatic);
        console.log("解除碰撞")
    });

    var keyObject = this.input.keyboard.addKey('S');
    keyObject.on('down', function (event) {
        player.setStatic(!player.isStatic);
        console.log("恢復碰撞")
    });
}

function update() {
    if (controlsEnabled2) {
        angle += 0.005;

        // 更新隕石的位置和旋轉
        // for (let i = meteors.length - 1; i >= 0; i--) {
        //     let meteor = meteors[i];
        //     meteor.x -= 3.5; // 向左移動
        //     meteor.rotation += 0.005; // 旋轉
        //     if (meteor.x < 0 - meteor.x) {
        //         meteor.x = originalMeteorPositions[i].x + 4000;
        //         meteor.y = originalMeteorPositions[i].y;
        //     }
        // }
        for (let i = meteors.length - 1; i >= 0; i--) {
            let meteor = meteors[i];
            if (meteor) {
                meteor.x -= 3.5;
                meteor.rotation += 0.005; // 旋转
                if (meteor.x < 0 - meteor.x) {
                    const originalPos = originalMeteorPositions[i];
                    if (originalPos) {
                        meteor.x = originalPos.x + 4000;
                        meteor.y = originalPos.y;
                    }
                }
            }
        }

        // 更新背景圖的位置
        background.x -= 1.5;
        StarBall1.x -= 0.5;
        StarBall2.x -= 2;

        // 更新 moveStone 的位置
        if (moveStone1) {
            moveStone1.x -= 6;
            moveStone1.y += 3;
        }

        if (moveStone2) {
            moveStone2.x -= 7;
            moveStone2.y -= 3;
        }

        // 這一關卡火箭只能夠進行垂直移動調整
        if (cursors.up.isDown) {
            player.setVelocityY(-1);
            player.setAngle(-40); // 調整火箭角度為 -40 度
        } else if (cursors.down.isDown) {
            player.setVelocityY(1);
            player.setAngle(20);
        } else if (cursors.right.isDown) {
            StarBall2.x -= 1.5;
            StarBall1.x -= 1;
            background.x -= 2;
            // 更新 moveStone 的位置
            if (moveStone1) {
                moveStone1.x -= 8;
                moveStone1.y += 4;
            }
            if (moveStone2) {
                moveStone2.x -= 9;
                moveStone2.y -= 4;
            }
            // 更新隕石的位置和旋轉
            meteors.forEach(meteor => {
                meteor.x -= 2; // 向左移動
            });
        } else {
            player.setVelocityX(0);
            player.setAngle(-10);
        }
    }
}

function resetPlayerPosition() {
    player.setPosition(initialPlayerPosition.x, initialPlayerPosition.y);
    player.setVelocity(0, 0);
    player.setAngle(0);

    background.x = 0;
    StarBall1.x = -300;
    StarBall2.x = 5800;


    meteors.forEach((meteor, index) => {
        if (meteor) {
            meteor.setPosition(originalMeteorPositions[index].x, originalMeteorPositions[index].y);
        }
    });
    moveStone1.setPosition(originalMoveStonePositions[0].x, originalMoveStonePositions[0].y);
    moveStone2.setPosition(originalMoveStonePositions[1].x, originalMoveStonePositions[1].y);

    clearTimeout(moveStone1Timer);
    clearTimeout(moveStone2Timer);
    startMoveStoneTimers();

}

function startMoveStoneTimers() {
    console.log('Setting timers for moveStone1 and moveStone2');
    moveStone1Timer = setTimeout(() => {
        console.log('moveStone1 timer triggered');
        // moveStone1.setActive(true);
        moveStone1.setVisible(true);
    }, 100);

    moveStone2Timer = setTimeout(() => {
        console.log('moveStone2 timer triggered');
        // moveStone2.setActive(true);
        moveStone2.setVisible(true);
    }, 100);
}
