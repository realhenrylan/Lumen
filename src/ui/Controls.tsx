type Props = {
  onReset: () => void;
  onHint: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function Controls({ onReset, onHint, onNext, onPrevious }: Props) {
  return (
    <div className="panel">
      <div className="buttons">
        <button onClick={onPrevious}>上一关</button>
        <button onClick={onReset}>重置</button>
        <button onClick={onHint}>提示</button>
        <button onClick={onNext}>下一关</button>
      </div>
    </div>
  );
}
