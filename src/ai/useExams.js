import { useCallback, useEffect, useRef, useState } from "react";
import { createExam, deleteExam, describeError, listExams } from "./api";

export default function useExams() {
  const [status, setStatus] = useState("loading");
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const creating = useRef(false);

  useEffect(() => {
    setStatus("loading");
    setError(null);
    listExams()
      .then((data) => {
        setExams(data);
        setStatus("ready");
      })
      .catch((err) => {
        setExams([]);
        setError(describeError(err));
        setStatus("error");
      });
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      await deleteExam(id);
      setExams((current) => current.filter((exam) => exam.id !== id));
      return true;
    } catch (err) {
      setActionError(describeError(err));
      return false;
    }
  }, []);

  const create = useCallback(async (title) => {
    if (creating.current) return false;
    creating.current = true;
    setSaving(true);
    setActionError(null);
    try {
      const exam = await createExam(title);
      setExams((current) => [...current, exam]);
      return true;
    } catch (err) {
      setActionError(describeError(err));
      return false;
    } finally {
      creating.current = false;
      setSaving(false);
    }
  }, []);

  return { status, exams, error, actionError, saving, reload, remove, create };
}
