function Footer() {
  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-4 px-6 py-10 text-center sm:px-8 lg:px-12">
        <span className="font-sans text-[18px] font-bold leading-none text-ink">
          Duelite
        </span>
        <p className="max-w-2xl font-sans text-[12px] leading-[1.4] text-ink-soft">
          Built overnight at NITHUB Innovation Fair Hackathon &apos;26 · Powered
          by BMONI sandbox · Test funds only · A Duelite build inspired by Duevy
        </p>
      </div>
    </footer>
  );
}

export { Footer };
