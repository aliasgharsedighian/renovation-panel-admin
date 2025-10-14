'use client';

import { Controller } from 'react-hook-form';
import { Editor } from '@tinymce/tinymce-react';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { useRef } from 'react';

interface TinyEditorProps {
  control: any;
  name: string;
  label?: string;
  height?: number;
}

export function TinyEditor({
  control,
  name,
  label = 'Description',
  height = 350
}: TinyEditorProps) {
  const editorRef = useRef<any>(null);

  const handleImageUpload: any = (
    blobInfo: any,
    progress: any,
    failure: any
  ) => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${process.env.AriyaRestoranAPI}article-file`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());
      //console.log(blobInfo.filename())

      xhr.upload.onprogress = (e) => {
        progress((e.loaded / e.total) * 100);
        if (progress && typeof progress === 'function') {
          const percent = 0;
          progress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 403) {
          reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject('HTTP Error: ' + xhr.status);
          return;
        }

        const json = JSON.parse(xhr.responseText);

        if (!json || typeof json.location != 'string') {
          reject('Invalid JSON: ' + xhr.responseText);
          return;
        }

        resolve(json.location);
      };

      xhr.onerror = () => {
        reject({ message: 'Image upload failed', remove: true });
        if (failure && typeof failure === 'function') {
          failure('Image upload failed');
        }
      };

      xhr.send(formData);
    });
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Editor
              apiKey="nxtwtyc0hadzcml0atnnb32w4tqznwfqcpq7my5za62akr8y"
              onInit={(_, editor) => (editorRef.current = editor)}
              value={field.value || ''}
              onEditorChange={(content) => field.onChange(content)}
              init={{
                plugins: [
                  'advlist',
                  'autolink',
                  'lists',
                  'link',
                  'charmap',
                  'preview',
                  'anchor',
                  'searchreplace',
                  'visualblocks',
                  'code',
                  'fullscreen',
                  'insertdatetime',
                  'media',
                  'table',
                  'help',
                  'wordcount',
                  'autosave',
                  'autoresize',
                  'codesample',
                  'directionality',
                  'emoticons',
                  'image',
                  'importcss',
                  'linkchecker',
                  'nonbreaking',
                  'pagebreak',
                  'quickbars',
                  'save',
                  //   'template',
                  'tinydrive',
                  'visualchars'
                ],
                images_upload_url: `${process.env.AriyaRestoranAPI}article-file`,
                automatic_uploads: true,
                images_reuse_filename: true,
                images_upload_handler: handleImageUpload
              }}
            />
          </FormControl>
          {fieldState?.error && (
            <FormMessage>{fieldState.error.message}</FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}
