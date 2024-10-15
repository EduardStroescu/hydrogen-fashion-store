export function Loader() {
  return (
    <div className="bg-black z-[9999] relative flex justify-center items-center w-full h-[100dvh] p-8">
      <div className="loaderShadow animate-spin rounded-full aspect-square w-[24rem] border-t-4 border-b-4 border-primary/50 border-t-primary/50 border-b-primary/50" />
      <p
        style={{fontFamily: 'serif'}}
        className="absolute text-4xl animate-pulse"
      >
        Loading...
      </p>
    </div>
  );
}
