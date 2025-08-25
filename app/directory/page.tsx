"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = {
  id: string;
  full_name: string | null;
  graduation_year: number | null;
  degree: string | null;
  branch: string | null;
  company: string | null;
  job_role: string | null;
  location: string | null;
  linkedin: string | null;
  avatar_url: string | null;
};

const PAGE_SIZE = 20;

export default function DirectoryPage() {
  const supabase = supabaseBrowser();

  // Filters / UI state
  const [q, setQ] = useState<string>("");
  const [degree, setDegree] = useState<string>("any");
  const [branch, setBranch] = useState<string>("any");
  const [year, setYear] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Data state
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const degreeOptions = useMemo(
    () => ["B.Tech", "B.E.", "M.Tech", "M.E.", "B.Sc", "M.Sc", "MBA", "Ph.D"],
    []
  );
  const branchOptions = useMemo(
    () => ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical", "AI/ML", "Data Science", "Other"],
    []
  );

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const safeErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : "Unexpected error";

  const fetchDirectory = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("public_directory")
        .select(
          "id, full_name, graduation_year, degree, branch, company, job_role, location, linkedin, avatar_url",
          { count: "exact" }
        );

      const qTrim = q.trim();
      if (qTrim) {
        query = query.or(
          [
            `full_name.ilike.%${qTrim}%`,
            `company.ilike.%${qTrim}%`,
            `job_role.ilike.%${qTrim}%`,
            `location.ilike.%${qTrim}%`,
          ].join(",")
        );
      }

      if (degree !== "any") query = query.eq("degree", degree);
      if (branch !== "any") query = query.eq("branch", branch);

      if (year.trim()) {
        const yr = Number.parseInt(year, 10);
        if (Number.isFinite(yr)) {
          query = query.eq("graduation_year", yr);
        } else {
          toast.error("Please enter a valid year");
          setLoading(false);
          return;
        }
      }

      query = query.order("graduation_year", { ascending: false }).range(from, to);

      const { data, error, count: c } = await query;

      if (error) throw error;

      setRows((data ?? []) as Row[]);
      setCount(c ?? 0);
    } catch (err: unknown) {
      toast.error(safeErrorMessage(err) || "Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, [branch, degree, from, q, supabase, to, year]);

  useEffect(() => {
    void fetchDirectory();
  }, [fetchDirectory]);

  const resetFilters = () => {
    setQ("");
    setDegree("any");
    setBranch("any");
    setYear("");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Alumni Directory</h1>

      {/* Filter Bar */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              placeholder="Search name, company, role, location"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="md:col-span-2"
              aria-label="Search alumni"
            />

            <Select
              value={degree}
              onValueChange={(val) => {
                setDegree(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Degree</SelectItem>
                {degreeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={branch}
              onValueChange={(val) => {
                setBranch(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Branch</SelectItem>
                {branchOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              inputMode="numeric"
              placeholder="Year"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
              aria-label="Graduation year"
            />

            <div className="md:col-span-4 flex gap-2">
              <Button onClick={() => void fetchDirectory()} disabled={loading}>
                {loading ? "Loading..." : "Apply Filters"}
              </Button>
              <Button variant="outline" onClick={resetFilters} disabled={loading}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                  {r.avatar_url ? (
                    <Image
                      src={r.avatar_url}
                      alt={r.full_name ?? "Avatar"}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 grid place-items-center text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium">
                    {r.full_name ?? "Unknown"}
                    {r.graduation_year ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ’{String(r.graduation_year).slice(-2)}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {[r.degree, r.branch].filter(Boolean).join(" • ") || "—"}
                  </div>
                  <div className="mt-1 text-sm">
                    {[r.company, r.job_role].filter(Boolean).join(" • ") || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">{r.location || "—"}</div>
                  {r.linkedin ? (
                    <a
                      href={r.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm underline"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Prev
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages} ({count} results)
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
