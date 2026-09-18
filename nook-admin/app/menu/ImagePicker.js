'use client';
/* eslint-disable @next/next/no-img-element -- previews of pictures hosted on the customer website, not this app */

import { useRef, useState } from 'react';
import { WEB_URL, useAdmin } from '../components/AdminShell';

// Pictures that ship with the website
export const BUILT_IN_IMAGES = [
  'sandwiches.png', 'sandwiches2.png', 'sandwiches3.png',
  'wraps.png', 'wraps2.png', 'wraps3.png', 'wraps4.png',
  'savoury.png', 'savoury2.png', 'savoury3.png', 'savoury4.png',
  'dipsandsticks.png', 'dips2.png', 'dips3.png', 'dips4.png',
  'fruit.png', 'fruit2.png', 'fruit3.png', 'fruit5.png',
  'cake.png', 'cake2.png', 'cake3.png', 'cake4.png',
  'continental1.png', 'continental2.png', 'fullbuffet1.png', 'fullbuffet2.png',
  'kidscake.png', 'kidscrisps.png', 'food2.png', 'nook.jpg',
].map(file => `/assets/${file}`);

const isUploaded = (url) => url.startsWith('/assets/uploads/');

/**
 * One image slot. Clicking it opens a picker with every known image, an upload
 * button, and delete buttons on uploaded images.
 *
 * @param {string[]} images - Every image path to offer
 * @param {function} onImagesChange - Called with the new list after an upload or delete
 */
export default function ImagePicker({ label, value, onChange, images, onImagesChange }) {
  const { api } = useAdmin();
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const fileRef = useRef(null);

  const pick = (url) => { onChange(url); setOpen(false); };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setWorking(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await api('/api/uploads/image', { method: 'POST', body: formData });
      if (data.return_code === 'SUCCESS') {
        onImagesChange([...images, data.url]);
        pick(data.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setWorking(false);
    }
  };

  const remove = async (e, url) => {
    e.stopPropagation();
    const filename = url.split('/').pop();
    if (!confirm(`Delete the picture "${filename}" for good?\n\nAny category still using it will show no picture.`)) return;
    setWorking(true);
    try {
      const data = await api(`/api/uploads/image/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      if (data.return_code === 'SUCCESS') {
        onImagesChange(images.filter(img => img !== url));
        if (value === url) onChange(null);
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch {
      alert('Delete failed. Please try again.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <button type="button" className="img-slot" onClick={() => setOpen(true)} title={`${label} — click to change`}>
        {value ? <img src={`${WEB_URL}${value}`} alt={label} /> : `${label}: none`}
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="card-head">
              <h3 className="card-title">Choose {label.toLowerCase()}</h3>
              <button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="img-grid">
              <div className={`img-option${!value ? ' selected' : ''}`} onClick={() => pick(null)}>
                <div className="img-none">–</div>
                No picture
              </div>
              <div className="img-option" onClick={() => !working && fileRef.current?.click()}>
                <div className="img-none">{working ? '…' : '+'}</div>
                {working ? 'Working…' : 'Upload new'}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={upload} />
              </div>
              {images.map(url => (
                <div key={url} className={`img-option${value === url ? ' selected' : ''}`} onClick={() => pick(url)}>
                  <img src={`${WEB_URL}${url}`} alt="" />
                  {url.split('/').pop().replace(/\.[^.]+$/, '')}
                  {isUploaded(url) && (
                    <button type="button" className="img-delete" onClick={(e) => remove(e, url)} disabled={working} title="Delete this picture">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
