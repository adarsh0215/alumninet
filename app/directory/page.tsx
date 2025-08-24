"use client";

import { useEffect, useMemo, useState } from "react";
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
import Image from "next/image";
import { toast } from "sonner";

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
  const [q, setQ] = useState("");
  const [degree, setDegree] = useState<string>("any"); // "any" means no filter
  const [branch, setBranch] = useState<string>("any");
  const [year, setYear] = useState<string>("");
  const [page, setPage] = useState(1);

  // Data state
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const degreeOptions = useMemo(
    () => ["B.Tech", "B.E.", "M.Tech", "M.E.", "B.Sc", "M.Sc", "MBA", "Ph.D"],
    []
  );
  const branchOptions = useMemo(
    () => ["CSE", "ECE", "EEE", "IT", "Mechanical", "Civil", "Chemical", "AI/ML", "Data Science", "Other"],
    []
  );

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  async function fetchDirectory() {
    try {
      setLoading(true);

      let query = supabase
        .from("public_directory")
        .select(
          "id, full_name, graduation_year, degree, branch, company, job_role, location, linkedin, avatar_url",
          { count: "exact" }
        );

      if (q.trim()) {
        query = query.or(
          `full_name.ilike.%${q.trim()}%,company.ilike.%${q.trim()}%,job_role.ilike.%${q.trim()}%,location.ilike.%${q.trim()}%`
        );
      }
      if (degree !== "any") query = query.eq("degree", degree);
      if (branch !== "any") query = query.eq("branch", branch);
      if (year.trim()) {
        const yr = Number(year);
        if (!Number.isNaN(yr)) query = query.eq("graduation_year", yr);
      }

      query = query.order("graduation_year", { ascending: false }).range(from, to);

      const { data, error, count: c } = await query;

      if (error) throw error;

      setRows(data ?? []);
      setCount(c ?? 0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load directory");
    } finally {
      setLoading(false);
    }
  }

  // Fetch on mount & whenever filters/page change
  useEffect(() => {
    fetchDirectory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, degree, branch, year, page]);

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
            {/* Search */}
            <Input
              placeholder="Search name, company, role, location"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="md:col-span-2"
            />

            {/* Degree (uses 'any') */}
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

            {/* Branch (uses 'any') */}
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

            {/* Year */}
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Year"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
            />

            <div className="md:col-span-4 flex gap-2">
              <Button onClick={() => fetchDirectory()} disabled={loading}>
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
                  ) : null}
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
