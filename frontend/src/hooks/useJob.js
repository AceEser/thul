import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "../services/api.js";

/** Starts a background job (POST) and polls its status until it finishes or fails. */
export default function useJob() {
  const [job, setJob] = useState(null);       // {id,status,progress,message,filename,size,error}
  const [starting, setStarting] = useState(false);
  const timer = useRef(null);

  const stop = () => { clearInterval(timer.current); timer.current = null; };
  useEffect(() => stop, []);

  const reset = useCallback(() => { stop(); setJob(null); setStarting(false); }, []);

  const start = useCallback(async (url, body) => {
    stop();
    setStarting(true);
    setJob({ status: "queued", progress: 0, message: "Starting…" });
    try {
      const { data } = await api.post(url, body);
      const poll = async () => {
        try {
          const { data: j } = await api.get(`/api/jobs/${data.job_id}`);
          setJob(j);
          if (j.status === "finished" || j.status === "error") stop();
        } catch (e) {
          stop();
          setJob({ status: "error", progress: 0, error: await errorMessage(e), message: "" });
        }
      };
      timer.current = setInterval(poll, 1000);
      poll();
    } catch (e) {
      setJob({ status: "error", progress: 0, error: await errorMessage(e), message: "" });
    } finally {
      setStarting(false);
    }
  }, []);

  return { job, starting, start, reset };
}
