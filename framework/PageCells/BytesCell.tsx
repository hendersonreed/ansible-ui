export function BytesCell(props: { bytes: number; decimals?: number }) {
  const { bytes } = props;
  if (!+bytes) return <></>;

  const k = 1024;
  const decimals = props.decimals ? props.decimals : 0;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return <>{`${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`}</>;
}
