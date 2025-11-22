
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setLanguageFilter, setSearchQuery } from '@/lib/store/filterSlice';

// Main Dashboard Page
export default function Filter({searchQuery, activeTab, languageFilter, languages}:any) {
    const dispatch = useDispatch();

  return (
    <div className="mb-4 flex gap-4">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="max-w-sm"
        />
        {activeTab === 'github' && (
          <Select
            value={languageFilter}
            onValueChange={(value) => dispatch(setLanguageFilter(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang:any) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
  );
}
