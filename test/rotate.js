function test1() {
  // setTransform 恢复坐标系
  const context = document.getElementById('main').getContext('2d');
  context.rotate(45 * Math.PI / 180);
  context.font = '20px STHeiti, SimHei';
  context.fillText('旋转，跳跃，我闭着眼', 60, -40, 188);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillRect(0, 0, 100, 100);
}

function test2() {
  // save + restore 也可以恢复坐标系的`平移和旋转`
  const context = document.getElementById('main').getContext('2d');
  context.save();
  context.translate(20, 20);
  context.rotate(45 * Math.PI / 180);
  context.font = '20px STHeiti, SimHei';
  context.fillText('旋转，跳跃，我闭着眼', 60, -40, 188);
  context.restore();
  context.fillRect(0, 0, 100, 100);
}