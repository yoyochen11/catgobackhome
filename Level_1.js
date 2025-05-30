const config =
{
    type: Phaser.AUTO,
    width: 1710,
    height: 900,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.3 },
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
let river1, river2, trap1, trap2;
let slowDuration = 10000; // 减速持续时间，单位为毫秒
let isSlowed = false; // 是否已经被减05
let material_1, material_2, material_3, material_4;
let cursors;
let progress = 0;
let infoText;
let nextStageText;
let groundObjects = []; // 用于存储所有的地面对象
let isOnGround = false;
let allItemsCollected = false;
let items = [];
let originalPositions = [];
let collectedItems = [];
let itemStates = {};
let requiredItems = 4;
//按鈕、故事
let clickableImage;
let controlsEnabled = false;
let firstClick = false;
let SecondClick = false;
//音效
let clickEff;
let catjump;
let stick;
let dropwater;
let cathurt;
let collect;
let Bgm1;

function preload() {
    // 載入需要的圖片路徑, 並設定變數名稱 
    this.load.image('sky', './assets/bg_treeAndSky.png');
    this.load.image('rocket', './assets/rocket.png');
    this.load.image('river', './assets/river.png');
    this.load.image('tree', './assets/tree.png');
    this.load.image('grass_green', './assets/grass_green.png');
    this.load.image('grass_blue', './assets/grass_blue.png');
    this.load.image('rocket', './assets/rocket.png');
    this.load.image('broken_rocket', './assets/broken_rocket.png');
    this.load.image('branch_1F', './assets/Branch_1_Front.png');
    this.load.image('branch_1B', './assets/Branch_1_Back.png');
    this.load.image('branch_2F', './assets/Branch_2_Front.png');
    this.load.image('branch_2B', './assets/Branch_2_Back.png');
    this.load.image('trap_1', './assets/trap_1.png');
    this.load.image('trap_2', './assets/trap_2.png');
    this.load.image('fragments_1', './assets/fragments1.png');
    this.load.image('fragments_2', './assets/fragments2.png');
    this.load.image('fragments_3', './assets/fragments3.png');
    this.load.image('fragments_4', './assets/fragments4.png');
    this.load.image('photo_hover', './assets/btn_click.png');
    this.load.image('photo', './assets/btn_unclick.png');

    // 加載音樂、音效
    this.load.audio('click', './SoundEffect/click.mp3')
    this.load.audio('jump', './SoundEffect/catjump.mp3')
    this.load.audio('stick', './SoundEffect/stick.mp3')
    this.load.audio('drop', './SoundEffect/dropwater.mp3')
    this.load.audio('hurt', './SoundEffect/cathurt.mp3')
    this.load.audio('collect', './SoundEffect/itemcollect.mp3')
    this.load.audio('bgm1', './SoundEffect/BGML1.mp3')

    // 加載精靈圖
    this.load.spritesheet('cat', './assets/newCat.png', { frameWidth: 132.4, frameHeight: 134 });

    // 加載形狀數據
    this.load.json('cat_data', './PhysicsEditor/circleBox.json');
    this.load.json('river_data', './PhysicsEditor/river.json');
    this.load.json('river_setFlipX_true_data', './PhysicsEditor/river_setFlipX_true.json');
    this.load.json('rocket_data', './PhysicsEditor/rocket.json');
    this.load.json('broken_rocket_data', './PhysicsEditor/broken_rocket.json');
    this.load.json('branch_1F_data', './PhysicsEditor/Branch_1_Front.json');
    this.load.json('branch_1F_data_setFlipX_true', './PhysicsEditor/Branch_1_Front_setFlipX_true.json');
    this.load.json('branch_2F_data_setFlipX_true', './PhysicsEditor/Branch_2_Front_setFlipX_true.json');
    this.load.json('branch_2F_data', './PhysicsEditor/Branch_2_Front.json');
    this.load.json('trap_1', './PhysicsEditor/trap_1.json');
    this.load.json('trap_2', './PhysicsEditor/trap_2.json');
    this.load.json('fragments1_data', './PhysicsEditor/fragments1.json');
    this.load.json('fragments2_data', './PhysicsEditor/fragments2.json');
    this.load.json('fragments3_data', './PhysicsEditor/fragments3.json');
    this.load.json('fragments4_data', './PhysicsEditor/fragments4.json');
}

function create() {
    //音效匯入
    Bgm1 = this.sound.add('bgm1', {
        volume: 0.3,
        loop: true
    });
    Bgm1.play();

    clickEff = this.sound.add('click', { volume: 0.2 });
    catjump = this.sound.add('jump', { volume: 1.2 });
    stick = this.sound.add('stick', { volume: 0.4 });
    dropwater = this.sound.add('drop', { volume: 1.5 });
    cathurt = this.sound.add('hurt', { volume: 1.5 });
    collect = this.sound.add('collect', { volume: 0.8 })

    let photo = this.add.image(860, 450, 'photo').setDepth(10).setScale(0.7).setInteractive();
    photo.setData('originalTexture', 'photo'); // 儲存原始照片
    photo.setData('hoverTexture', 'photo_hover'); // 儲存懸停的照片

    photo.on('pointerdown', function () {
        photo.setVisible(false);
        clickEff.play();
        if (!firstClick && !SecondClick) {
            // 第一次點擊圖片時顯示第二是視窗
            document.getElementById('overlay1').style.display = 'flex';
            firstClick = true;
        } else if (firstClick == true && !SecondClick) {
            // 第二次點擊圖片時顯示第二是視窗
            document.getElementById('overlay2').style.display = 'flex';
            SecondClickClick = true;
        } else {
            // 第二次點擊圖片時顯示第二是視窗
            document.getElementById('overlay3').style.display = 'flex';
        }
    });
    photo.on('pointerover', function () {
        photo.setTexture(photo.getData('hoverTexture'));
        document.body.style.cursor = 'pointer'; // 改變游標為指針
    });
    photo.on('pointerout', function () {
        photo.setTexture(photo.getData('originalTexture'));
        document.body.style.cursor = 'default'; // 恢復預設游標
    });
    document.getElementById('overlay1').addEventListener('click', function () {
        // 隱藏第一個視窗
        clickEff.play();
        document.getElementById('overlay1').style.display = 'none';
        document.getElementById('overlay2').style.display = 'flex';
        document.getElementById('overlay3').style.display = 'none';
    });
    document.getElementById('overlay2').addEventListener('click', function () {
        //  隱藏第二個視窗
        clickEff.play();
        document.getElementById('overlay2').style.display = 'none';
        document.getElementById('overlay3').style.display = 'flex';
    });
    document.getElementById('overlay3').addEventListener('click', function () {
        //  隱藏第二個視窗
        clickEff.play();
        document.getElementById('overlay3').style.display = 'none';
        controlsEnabled = true;
    });

    this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(0.417).setDepth(0);
    this.add.image(1230.5 * 1, 0, 'sky').setOrigin(0, 0).setScale(0.417).setDepth(0).setFlipX(true);
    this.add.image(1230.5 * 2, 0, 'sky').setOrigin(0, 0).setScale(0.417).setDepth(0);
    this.add.image(1230.5 * 3, 0, 'sky').setOrigin(0, 0).setScale(0.417).setDepth(0).setFlipX(true);

    this.add.image(1000, 0, 'tree').setScale(0.8).setDepth(15).setAlpha(0.5);
    this.add.image(600, 720, 'grass_blue').setScale(1).setDepth(4).setAlpha(0.5);
    this.add.image(1000 + 1230.5 * 2, 0, 'tree').setScale(0.8).setDepth(15).setAlpha(0.5);
    this.add.image(4550, 820, 'grass_green').setScale(1).setDepth(4).setAlpha(0.5);

    this.add.image(1550, 600 - 50, 'branch_1B').setScale(0.8).setDepth(1);
    this.add.image(2200, 340 - 100, 'branch_2B').setScale(0.8).setDepth(1);
    this.add.image(2300, 765 - 40, 'branch_1B').setScale(0.45).setDepth(1).setFlipX(true);
    this.add.image(4000, 600 - 50, 'branch_1B').setScale(0.8).setDepth(1);


    items.push(createItem.call(this, 2100, 450, 'fragments_1', 'fragments4_data', 'fragments4'));
    items.push(createItem.call(this, 3500, 180, 'fragments_2', 'fragments1_data', 'fragments1'));
    items.push(createItem.call(this, 4750, 130, 'fragments_3', 'fragments3_data', 'fragments3'));
    items.push(createItem.call(this, 3200, 440, 'fragments_4', 'fragments2_data', 'fragments2'));

    items.forEach(item => {
        itemStates[item.image.texture.key] = {
            x: item.image.x,
            y: item.image.y,
            collected: false // 初始状态为未被收集
        };
    });

    river1 = this.matter.add.image(1500, 850, 'river', null, {
        shape: this.cache.json.get('river_data').river,
        isStatic: true // 設置河流1為靜態物體
    }).setDepth(8).setFriction(1).setScale(0.3).setAlpha(0.5);

    river2 = this.matter.add.image(4644.5, 850, 'river', null, {
        shape: this.cache.json.get('river_setFlipX_true_data').river_setFlipX_true,
        isStatic: true // 設置河流2為靜態物體
    }).setDepth(8).setFriction(1).setScale(0.3).setAlpha(0.5).setFlipX(true);

    var ground1 = this.matter.add.image(470, 770, 'broken_rocket', null, {
        shape: this.cache.json.get('broken_rocket_data').broken_rocket,
        isStatic: true // 設置火箭為靜態物體
    }).setDepth(5).setFriction(1).setScale(0.85).setAngle(-5);
    groundObjects.push(ground1);

    let ground2 = this.matter.add.image(1550, 600, 'branch_1F', null, {
        shape: this.cache.json.get('branch_1F_data').Branch_1_Front,
        isStatic: true // 設置樹枝1為靜態物體
    }).setDepth(2).setFriction(1).setScale(0.8).setFlipX(true);
    groundObjects.push(ground2);

    let ground3 = this.matter.add.image(2200, 340, 'branch_2F', null, {
        shape: this.cache.json.get('branch_2F_data').Branch_2_Front,
        isStatic: true // 設置樹枝2為靜態物體
    }).setDepth(2).setFriction(1).setScale(0.8);
    groundObjects.push(ground3);

    trap2 = this.matter.add.image(2400, 300, 'trap_2', null, {
        shape: this.cache.json.get('trap_2').trap_2,
        isStatic: true // 設置陷阱2為靜態物體
    }).setDepth(2).setFriction(1).setScale(0.8);

    let ground4 = this.matter.add.image(2300, 765, 'branch_1F', null, {
        shape: this.cache.json.get('branch_1F_data').Branch_1_Front,
        isStatic: true // 設置樹枝3為靜態物體
    }).setDepth(2).setFriction(1).setScale(0.7).setFlipX(true);
    groundObjects.push(ground4);

    // material_1 = this.matter.add.image(2100, 450, 'fragments_1', null, {
    //     shape: this.cache.json.get('fragments4_data').fragments4,
    //     isStatic: true // 設置火箭碎片1為靜態物體
    // }).setDepth(2).setFriction(1).setScale(0.8).setOrigin(0.5, 0.45);

    trap1 = this.matter.add.image(3200, 760, 'trap_1', null, {
        shape: this.cache.json.get('trap_1').trap_1,
        isStatic: true // 設置陷阱1為靜態物體
    }).setDepth(3).setFriction(1).setScale(0.7);

    // material_4 = this.matter.add.image(3200, 440, 'fragments_4', null, {
    //     shape: this.cache.json.get('fragments2_data').fragments2,
    //     isStatic: true // 設置火箭碎片4為靜態物體
    // }).setDepth(2).setFriction(1).setScale(0.8).setOrigin(0.5, 0.5);

    let ground5 = this.matter.add.image(3190, 810, 'branch_2F', null, {
        shape: this.cache.json.get('branch_2F_data_setFlipX_true').Branch_2_Front_setFlipX_true,
        isStatic: true // 設置樹枝4為靜態物體
    }).setDepth(2).setFriction(1).setScale(1.2).setFlipX(true);
    groundObjects.push(ground5);

    // material_2 = this.matter.add.image(3500, 180, 'fragments_2', null, {
    //     shape: this.cache.json.get('fragments1_data').fragments1,
    //     isStatic: true // 設置火箭碎片2為靜態物體
    // }).setDepth(2).setFriction(1).setScale(0.8).setOrigin(0.5, 0.5);

    let ground6 = this.matter.add.image(4000, 600, 'branch_1F', null, {
        shape: this.cache.json.get('branch_1F_data_setFlipX_true').Branch_1_Front_setFlipX_true,
        isStatic: true // 設置樹枝5為靜態物體
    }).setDepth(2).setFriction(1).setScale(0.8).setFlipX(true);
    groundObjects.push(ground6);

    player = this.matter.add.sprite(500, 200, 'cat', null, {
        shape: this.cache.json.get('cat_data').circleBox
    }).setScale(1).setDepth(10);

    let ground7 = this.matter.add.image(4700, 450, 'branch_1F', null, {
        shape: this.cache.json.get('branch_1F_data').Branch_1_Front,
        isStatic: true // 設置樹枝6為靜態物體
    }).setDepth(2).setFriction(1).setScale(0.7).setFlipX(true);
    groundObjects.push(ground7);

    // material_3 = this.matter.add.image(4750, 130, 'fragments_3', null, {
    //     shape: this.cache.json.get('fragments3_data').fragments3,
    //     isStatic: true // 設置火箭碎片3為靜態物體
    // }).setDepth(2).setFriction(1).setScale(0.8).setOrigin(0.5, 0.5);

    // 在plater成功載入後，進行一些設置
    player.once('addedtoscene', () => {
        // 設置是否靜態（是否受世界邊界碰撞）
        player.setStatic(false); // 如果希望物體在世界邊界內碰撞，將參數設置為 false
        player.body.setBounce(0.3); // 設置彈性
        player.setFriction(0.1); // 设置摩擦力的值，你可以根据需要调整
        player.setGravityY(60); // 设置玩家的垂直重力
        player.setFixedRotation(true); // 防止玩家旋轉
    });

    // 设置碰撞检测
    this.matterCollision.addOnCollideStart({
        objectA: player,
        objectB: trap2,
        callback: function () {
            stick.play();
            if (!isSlowed) {
                // 减速效果
                player.setVelocityX(player.body.velocity.x * 0.5); // 减少速度
                player.setVelocityY(player.body.velocity.y * 0.5);
                isSlowed = true;
                console.log('Player collided with trap2');

                // 启动一个定时器，在减速持续时间后恢复正常速度
                this.time.delayedCall(slowDuration, function () {
                    // 恢复正常速度
                    player.setVelocityX(0);
                    player.setVelocityY(0);
                    isSlowed = false;
                }, [], this);
            }
        },
        context: this
    });

    // 设置碰撞检测
    this.matterCollision.addOnCollideStart({
        objectA: player,
        callback: function (eventData) {
            const bodyB = eventData.bodyB;
            const gameObjectB = bodyB.gameObject;

            // 检查是否与任何地面对象重叠
            if (groundObjects.includes(gameObjectB)) {
                isOnGround = true;
            }

            //检查cat是否与river1或river2重叠
            if (gameObjectB === river1) {
                player.setPosition(500, 200);
                progress = 0;
                allItemsCollected = false;
                resetCollectedItems.call(this);
                infoText.setText('小心！所有收集的道具已遺失！');
                dropwater.play();
                console.log('river1');
            } else if (gameObjectB === river2) {
                player.setPosition(500, 200);
                progress = 0;
                allItemsCollected = false;
                resetCollectedItems.call(this);
                infoText.setText('小心！所有收集的道具已遺失！');
                dropwater.play();
                console.log('river2');
            } else if (gameObjectB === trap1) {
                player.setPosition(500, 200);
                progress = 0;
                allItemsCollected = false;
                resetCollectedItems.call(this);
                infoText.setText('小心！所有收集的道具已遺失！');
                cathurt.play();
                console.log('trap1');
            } else {
                console.log('Collided with:', gameObjectB);
            }
            // if (gameObjectB === river1 || gameObjectB === river2 || gameObjectB === trap1) {
            //     player.setPosition(500, 200);
            //     console.log('Player touched a trap! Progress reset.');
            //     // 重設進度
            //     progress = 0;
            //     allItemsCollected = false;
            //     // 重置道具狀態
            //     resetCollectedItems.call(this);
            //     // 更新提示信息
            //     infoText.setText('小心！所有收集的道具已遺失！');
            // } else {
            //     console.log('Collided with:', gameObjectB);
            // }
        },
        context: this
    });
    //initItemCollisions.call(this);

    // 检查离开地面的碰撞检测
    this.matterCollision.addOnCollideEnd({
        objectA: player,
        callback: function (eventData) {
            const bodyB = eventData.bodyB;
            const gameObjectB = bodyB.gameObject;

            // 如果与地面对象分离，则设置 isOnGround 为 false
            if (groundObjects.includes(gameObjectB)) {
                isOnGround = false;
            }
        },
        context: this
    });

    // 設置貓咪與撿起物件的碰撞檢測
    // const materials = [material_1, material_2, material_3, material_4];
    // materials.forEach((material, index) => {
    //     this.matterCollision.addOnCollideStart({
    //         objectA: player,
    //         objectB: material,
    //         callback: function (eventData) {
    //             // 碰撞後的處理邏輯
    //             material.destroy();  // 撿起物件消失
    //             progress += 1;
    //             infoText.setText(`碎片收集進度 : ${progress} / 4`);  // 更新文字顯示
    //             // 其他處理邏輯，如分數增加、播放音效等
    //             checkItemsCollected();  // 檢查所有撿起物件是否都已被撿起
    //         },
    //         context: this
    //     });
    // });

    items.forEach((item, index) => {
        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: item.image,
            callback: function (eventData) {
                // 使用 itemStates 來檢查是否已經收集過
                if (!itemStates[item.image.texture.key].collected) {
                    itemStates[item.image.texture.key].collected = true;  // 標記為已收集
                    collectedItems.push(item);  // 將道具添加到已收集列表
                    item.image.destroy();  // 撿起物件消失
                    progress += 1;
                    infoText.setText(`碎片收集進度 : ${progress} / 4`);  // 更新文字顯示
                    collect.play();
                    checkItemsCollected(requiredItems);  // 檢查所有撿起物件是否都已被撿起
                    collect.play();
                }
            },
            context: this
        });
    });

    // 設置字體樣式
    var textStyle = {
        fontFamily: 'LXGW WenKai Mono TC, Arial, sans-serif', // 使用你在Google Fonts上選擇的字體名稱
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
    };

    this.nextStageText = this.add.text(400, 300, '零件收集組裝完成，準備返家', textStyle);
    this.nextStageText.setOrigin(0.5); // 使文本居中对齐
    this.nextStageText.setVisible(false); // 初始设为不可见

    this.matterCollision.addOnCollideStart({
        objectA: player,
        objectB: ground1,
        callback: function (eventData) {
            if (allItemsCollected) {
                // 所有道具收集完畢且觸碰到火箭，進行頁面跳轉
                console.log('Player touched the rocket! Proceeding to the next level.');
                this.nextStageText.setVisible(true);
                
                ground1.setVisible(false);

                let newRocket = this.matter.add.image(471, 760, 'rocket', null, {
                    shape: this.cache.json.get('rocket_data').rocket,
                    isStatic: true // 设置火箭为静态物体
                }).setDepth(5).setFriction(1).setScale(0.21).setAngle(-5);
                groundObjects.push(newRocket);

                setTimeout(() => {

                    window.location.href = 'Level_2.html';
                }, 5000)
            }
        },
        context: this
    });

    // 創建信息文本
    infoText = this.add.text(40, 40, `碎片收集進度 : 0 / 4`, textStyle);
    infoText.setScrollFactor(0).setDepth(20);

    // 設定玩家動畫
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'cat', frame: 4 }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cat', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // 增加輸入偵測
    cursors = this.input.keyboard.createCursorKeys();

    // 相機一些設定
    this.cameras.main.startFollow(player);
    this.matter.world.setBounds(0, 0, 4900, 900);
    let camera = this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, 4900, 900);
    camera.setViewport(0, 0, 1710, 900);

    var keyObject = this.input.keyboard.addKey('F');
    keyObject.on('down', function (event) {
        requiredItems = 1;
        infoText.setText(`碎片收集進度 : ${progress} / 1`);

    });

    initItemCollisions.call(this);
}

function update() {
    if (controlsEnabled) {
        if (cursors.up.isDown && isOnGround) {
            catjump.play();
            // 执行跳跃动作
            player.setVelocityY(-8); // 这里的 -8 是跳跃的速度，你可以根据需要调整
            // 更新上一次跳跃的时间
            lastJumpTime = this.time.now;
            isOnGround = false; // 跳跃后，角色不再接触地面
        } else if (cursors.left.isDown) {
            player.setVelocityX(-3);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(3);
            player.anims.play('right', true);
        } else if (cursors.down.isDown) {
            player.setVelocityY(5);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
}
function checkItemsCollected() {
    // 檢查所有撿起物件是否都已被撿起
    if (progress === requiredItems) {
        // 所有撿起物件都已被撿起，進入下一關
        console.log('All items collected! Proceed to the next level.');
        infoText.setText('碎片都已收集完畢! 快回去火箭吧!');
        allItemsCollected = true;
    }
}
function fastCollected() {
    if (progress === 1) {
        // 所有撿起物件都已被撿起，進入下一關
        console.log('All items collected! Proceed to the next level.');
        infoText.setText('碎片都已收集完畢! 快回去火箭吧!');
        allItemsCollected = true;
    }
}

function resetCollectedItems() {
    items.forEach(item => {
        if (itemStates[item.image.texture.key].collected) {
            let originalX = itemStates[item.image.texture.key].x;
            let originalY = itemStates[item.image.texture.key].y;

            let newItem = this.matter.add.image(originalX, originalY, item.image.texture.key, null, {
                shape: this.cache.json.get(item.dataKey)[item.shapeKey],
                isStatic: true
            }).setDepth(2).setFriction(1).setScale(0.8).setOrigin(0.5, 0.5);
            item.image = newItem;
            itemStates[item.image.texture.key].collected = false;
        }
    });

    initItemCollisions.call(this);
}

function createItem(x, y, texture, dataKey, shapeKey) {
    let item = this.matter.add.image(x, y, texture, null, {
        shape: this.cache.json.get(dataKey)[shapeKey],
        isStatic: true
    }).setDepth(2).setFriction(1).setScale(0.8).setOrigin(0.5, 0.5);

    return { image: item, dataKey: dataKey, shapeKey: shapeKey };
}


function initItemCollisions() {
    items.forEach((item, index) => {
        this.matterCollision.addOnCollideStart({
            objectA: player,
            objectB: item.image,
            callback: function (eventData) {
                if (!itemStates[item.image.texture.key].collected) {
                    itemStates[item.image.texture.key].collected = true;
                    item.image.destroy();
                    progress++;
                    infoText.setText(`碎片收集進度 : ${progress} / 4`);
                    checkItemsCollected();
                }
            },
            context: this
        });
    });
}



