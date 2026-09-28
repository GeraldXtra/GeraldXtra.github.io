import { useEffect, useImperativeHandle, useRef } from "react";
import Icon from "./Icon";
import { CERTIFICATE } from "../data/hackathons";

/* Certificate: the thumbnail opens the full certificate in a native dialog.
   The full image is only requested the first time it opens. */
export default function CertificateDialog({ ref }) {
  const dialogRef = useRef(null);
  const imgRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      open() {
        const dlg = dialogRef.current;
        const big = imgRef.current;
        if (!dlg || typeof dlg.showModal !== "function") return;
        if (!big.getAttribute("src")) big.src = CERTIFICATE.image;
        dlg.showModal();
        document.body.style.overflow = "hidden";
      },
    }),
    [],
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg || typeof dlg.showModal !== "function") return undefined;
    const closeBtn = dlg.querySelector("[data-cert-close]");
    const close = () => dlg.close();
    const onBackdrop = (e) => {
      if (e.target === dlg) dlg.close();
    };
    const onClose = () => {
      document.body.style.overflow = "";
    };
    closeBtn.addEventListener("click", close);
    dlg.addEventListener("click", onBackdrop);
    dlg.addEventListener("close", onClose);
    return () => {
      closeBtn.removeEventListener("click", close);
      dlg.removeEventListener("click", onBackdrop);
      dlg.removeEventListener("close", onClose);
    };
  }, []);

  return (
    <dialog className="lightbox" id="cert-dialog" aria-labelledby="cert-dialog-title" ref={dialogRef}>
      <div className="lightbox__bar">
        <p id="cert-dialog-title">{CERTIFICATE.dialogTitle}</p>
        <button className="icon-btn" type="button" data-cert-close="" aria-label="Close the certificate">
          <Icon name="close" />
        </button>
      </div>
      <img className="lightbox__img" alt={CERTIFICATE.alt} width={CERTIFICATE.width} height={CERTIFICATE.height} ref={imgRef} />
    </dialog>
  );
}
