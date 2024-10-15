import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import {getFormikKeys} from '../lib/utils';

import {FailIcon, SuccessIcon} from '~/components';
import {json} from '@shopify/remix-oxygen';

export async function action({request, context}) {
  const formikKeys = await getFormikKeys(context);
  const formData = await request.formData();
  const values = Object.fromEntries(formData);

  try {
    const payload = {
      service_id: formikKeys.SERVICE_ID,
      template_id: formikKeys.TEMPLATE_ID,
      user_id: formikKeys.PUBLIC_KEY,
      template_params: {
        user_name: values.user_name,
        user_email: values.user_email,
        message: values.message,
      },
    };

    const response = await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      // If the response is JSON, parse it; otherwise, return the text
      const responseData = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      return json({success: true, response: responseData}, {status: 200});
    } else {
      const errorData = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      throw new Error(errorData || 'Failed to send email');
    }
  } catch (error) {
    return json({success: false, error: error.message}, {status: 500});
  }
}

export default function Contact() {
  const [messageSent, setMessageSent] = useState(null);
  const [messageReceived, setMessageReceived] = useState(false);

  const formik = useFormik({
    initialValues: {
      user_name: '', //user name
      user_email: '', // user email
      message: '', // message of email
    },
    validationSchema: Yup.object({
      user_name: Yup.string().required('* Name field is required'),
      user_email: Yup.string()
        .email('Invalid email address')
        .required('* Email field is required')
        .matches(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          '* Please enter a valid email address',
        ),
      message: Yup.string().required('* Message field is required'),
    }),
    onSubmit: async (values, {setSubmitting, resetForm}) => {
      try {
        const response = await fetch('/contact', {
          method: 'POST',
          body: new URLSearchParams(values),
        });

        if (response.ok) {
          setSubmitting(false);
          setMessageSent(true);
          setMessageReceived(true);
          resetForm();
          setTimeout(() => setMessageSent(false), 5000);
        } else {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error);
        }
      } catch (error) {
        setSubmitting(false);
        setMessageSent(true);
        setMessageReceived(false);
        setTimeout(() => setMessageSent(false), 5000);
      }
    },
  });

  return (
    <div className="flex justify-center my-24 py-4 px-4 pointer-events-auto bg-black/60 backgrop-blur-sm overflow-hidden">
      <div className="max-w-md w-full">
        <h1 className="text-4xl">Contact Us</h1>
        <form onSubmit={formik.handleSubmit} className="mt-6 sm:mt-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="relative z-0 col-span-2 sm:col-auto">
              <input
                type="text"
                name="user_name"
                id="user_name"
                onChange={formik.handleChange}
                value={formik.values.user_name}
                className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-2 text-white focus:border-primary focus:outline-none focus:ring-0 caret-primary "
                placeholder=""
              />
              <label
                htmlFor="user_name"
                className="absolute top-3 -z-10 origin-[0] -translate-y-7 scale-75 transform  text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-7 peer-focus:italic peer-focus:scale-90 peer-focus:text-primary"
              >
                Your name
              </label>
              {formik.touched.user_name && formik.errors.user_name && (
                <div className="bg-[#220140] rounded text-red-500 text-[0.8rem] text-center py-1 mt-2">
                  {formik.errors.user_name}
                </div>
              )}
            </div>
            <div className="relative z-0 col-span-2 sm:col-auto">
              <input
                type="email"
                name="user_email"
                id="user_email"
                onChange={formik.handleChange}
                value={formik.values.user_email}
                className="peer block w-full appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-2 text-white focus:border-primary focus:outline-none focus:ring-0 caret-primary"
                placeholder=""
              />
              <label
                htmlFor="user_email"
                className="absolute top-3 -z-10 origin-[0] -translate-y-7 scale-75 transform text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:italic peer-focus:text-primary"
              >
                Your email
              </label>
              {formik.touched.user_email && formik.errors.user_email && (
                <div className="bg-[#220140] rounded text-red-500 text-[0.8rem] text-center py-1 mt-2">
                  {formik.errors.user_email}
                </div>
              )}
            </div>
            <div className="relative z-0 col-span-2">
              <textarea
                name="message"
                id="message"
                rows="5"
                onChange={formik.handleChange}
                value={formik.values.message}
                className="peer block w-full h-[100px] sm:h-auto appearance-none border-0 border-b border-gray-300 bg-transparent py-2.5 px-2 text-primary focus:border-primary focus:outline-none focus:ring-0 resize-none overflow-y-auto caret-primary"
                placeholder=" "
              ></textarea>
              <label
                htmlFor="message"
                className="absolute top-3 -z-10 origin-[0] -translate-y-7 scale-75 transform text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-7 peer-focus:scale-90 peer-focus:italic peer-focus:text-primary"
              >
                Your message
              </label>
              {formik.touched.message && formik.errors.message && (
                <div className="bg-[#220140] rounded w-1/2 text-red-500 text-[0.8rem] text-center py-1 mt-2">
                  {formik.errors.message}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            value="Send"
            disabled={formik.isSubmitting}
            className="bg-contrast text-primary/80 rounded py-2 px-4 focus:shadow-outline block w-full mt-5 hover:scale-105 hover:text-primary/100"
          >
            {formik.isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
      <section
        key={messageSent}
        className={`${
          messageSent == true
            ? 'bounceInRight'
            : messageSent == false
            ? 'bounceOutRight'
            : 'opacity-0'
        } absolute top-16 right-4 overflow-hidden`}
      >
        <div
          className="p-2 bg-[#047C77]/60 items-center text-primary leading-none rounded-full flex lg:inline-flex"
          role="alert"
        >
          <span className="flex rounded-full bg-[#024B47] uppercase px-2 py-1 text-xs font-bold mr-3">
            {messageReceived ? <SuccessIcon /> : <FailIcon />}
          </span>
          <span className="font-semibold mr-2 text-left flex-auto">
            {messageReceived
              ? 'Message Sent'
              : 'Failed: Please try again later'}
          </span>
        </div>
      </section>
    </div>
  );
}
