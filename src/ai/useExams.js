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
    listExams()
      .then((data) => {
        setExams(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Error loading exams", err);
        setExams([]);
        setStatus("ready");
      });
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const remove = useCallback(async (id) => {
    try {
      await deleteExam(id);
      setExams((current) => current.filter((exam) => exam.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting exam", err);
    }
  }, []);

  const create = useCallback(async (title) => {
    if (creating.current) return false;
    creating.current = true;
    setSaving(true);
    try {
      const exam = await createExam(title);
      setExams((current) => [...current, exam]);
      return true;
    } catch (err) {
      console.error("Error creating exam", err);
      return false;
    } finally {
      creating.current = false;
      setSaving(false);
    }
  }, []);

  return { status, exams, error, actionError, saving, reload, remove, create };
}
