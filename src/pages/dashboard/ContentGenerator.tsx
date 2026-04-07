import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, RefreshCw, Calendar } from "lucide-react";
import { useState } from "react";

const mockPosts = [
  {
    id: 1,
    caption: "Transforme sua rotina com nossos novos produtos naturais. Cada detalhe pensado para o seu bem-estar. Descubra o que a natureza tem de melhor para oferecer.",
    hashtags: ["#bemestar", "#natural", "#saudavel", "#lifestyle"],
  },
  {
    id: 2,
    caption: "Novo drop chegando! Prepare-se para uma experiência sensorial única. Qualidade premium, do campo à sua casa.",
    hashtags: ["#novidade", "#premium", "#qualidade", "#lancamento"],
  },
  {
    id: 3,
    caption: "Sua semana merece começar com energia. Confira nossas dicas exclusivas para uma segunda-feira produtiva e leve.",
    hashtags: ["#motivacao", "#segundafeira", "#produtividade", "#dicas"],
  },
];

const ContentGenerator = () => {
  const [generated, setGenerated] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Gerador de Conteúdo com IA</h1>
      <div className="grid lg:grid-cols-[2fr_3fr] gap-0 card-surface rounded-xl overflow-hidden">
        {/* Left panel */}
        <div className="p-6 border-r border-border space-y-5">
          <div className="space-y-2">
            <label className="text-label">Cliente</label>
            <Select defaultValue="1">
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Studio Design</SelectItem>
                <SelectItem value="2">Tech Corp</SelectItem>
                <SelectItem value="3">Café Aroma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-label">Rede Social</label>
            <Select defaultValue="instagram">
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-label">Tema ou produto desta semana</label>
            <Textarea placeholder="Descreva o tema, produto ou serviço..." className="bg-background min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <label className="text-label">Tom de voz</label>
            <Select defaultValue="professional">
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="casual">Descontraído</SelectItem>
                <SelectItem value="inspirational">Inspiracional</SelectItem>
                <SelectItem value="educational">Educativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-label">Quantidade de posts</label>
            <Select defaultValue="5">
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 posts</SelectItem>
                <SelectItem value="10">10 posts</SelectItem>
                <SelectItem value="15">15 posts</SelectItem>
                <SelectItem value="30">30 posts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" size="lg" onClick={() => setGenerated(true)}>
            Gerar conteúdo
          </Button>
        </div>
        {/* Right panel */}
        <div className="p-6">
          {!generated ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-text-disabled">Os posts gerados aparecem aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-label mb-4">3 posts gerados</p>
              {mockPosts.map((post) => (
                <div key={post.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">{post.caption}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((h) => (
                      <span key={h} className="text-xs px-2 py-1 rounded-md bg-elevation text-muted-foreground">{h}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm"><Calendar className="w-3 h-3 mr-1" />Agendar</Button>
                    <Button variant="ghost" size="sm"><RefreshCw className="w-3 h-3 mr-1" />Regenerar</Button>
                    <Button variant="ghost" size="sm"><Copy className="w-3 h-3 mr-1" />Copiar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
