type Props = {
  onReset: () => void;
  onHint: () => void;
  onNext: () => void;
};

export function Controls({ onReset, onHint, onNext }: Props) {
  return (
    <div className="panel">
      <div className="buttons">
        <button onClick={onReset}>重置</button>
        <button onClick={onHint}>提示</button>
        <button onClick={onNext}>下一关</button>
      </div>
    </div>
  );
}
