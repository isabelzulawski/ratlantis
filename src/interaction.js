// An interaction must begin AND end on the same object. Releasing a world
// movement gesture over an object (or closing a DOM panel) is never inspection.
export function validObjectClick(
  press,
  target,
  pointer,
  blocked,
  now = performance.now(),
) {
  return (
    !blocked &&
    now - (press?.startedAt ?? now) <= 300 &&
    press?.target === target &&
    press.pointerId === pointer.id &&
    Math.hypot(pointer.x - press.x, pointer.y - press.y) < 8
  );
}
